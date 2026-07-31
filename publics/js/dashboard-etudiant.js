const token = localStorage.getItem('token');
const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
const REDIRECT_BY_ROLE = {
    admin: '/dashboard-admin',
    teacher: '/dashboard-prof',
    student: '/dashboard-etudiant'
};

if (!token || !currentUser) {
    window.location.replace('/login.html');
} else if (currentUser.role !== 'student' && currentUser.role !== 'admin') {
    const redirectUrl = REDIRECT_BY_ROLE[currentUser.role] || '/login.html';
    window.location.replace(redirectUrl);
}

document.querySelector('.logout-btn').addEventListener('click', async () => {
    console.log('[dashboard-etudiant] Déconnexion demandée');
    const result = await apiFetch('/auth/logout', { method: 'POST' });
    console.log('[dashboard-etudiant] Résultat logout API:', result);
    localStorage.clear();
    window.location.href = '/login.html';
});

function noteClass(note) {
    if (note >= 14) return 'note-good';
    if (note >= 10) return 'note-medium';
    return 'note-bad';
}

function formatDateFr(isoDate) {
    if (!isoDate) return '';
    const [y, m, d] = isoDate.split('-');
    return `${d}/${m}/${y}`;
}

async function chargerDashboardEtudiant() {
    console.log('[dashboard-etudiant] Début chargement dashboard');
    // 1. Récupère la fiche étudiant liée à l'utilisateur connecté (ou tous les étudiants pour l'admin)
    let student;
    let allStudents = [];
    
    if (currentUser.role === 'admin') {
        console.log('[dashboard-etudiant] Récupération tous les étudiants (admin)');
        // Pour l'admin, on récupère tous les étudiants et on affiche une vue globale
        allStudents = await apiFetch('/students');
        console.log('[dashboard-etudiant] Étudiants récupérés:', allStudents?.length);
        if (!Array.isArray(allStudents) || allStudents.length === 0) {
            console.error('[dashboard-etudiant]', 'Aucun étudiant trouvé');
            return;
        }
        // Afficher les infos admin
        document.querySelector('.user-name').textContent = currentUser.name || currentUser.email;
        document.querySelector('.user-role').textContent = 'Administrateur · Vue globale étudiants';
        document.querySelector('.subtitle').textContent = `Vue administrateur : ${allStudents.length} étudiant(s)`;
    } else {
        console.log('[dashboard-etudiant] Récupération profil étudiant');
        // Pour l'étudiant, on récupère son propre profil
        student = await apiFetch('/students/me');
        console.log('[dashboard-etudiant] Étudiant récupéré:', student);
        if (student.error) {
            console.error('[dashboard-etudiant]', student.error);
            return;
        }
        document.querySelector('.user-name').textContent = `${student.prenom} ${student.nom}`;
        document.querySelector('.user-role').textContent = `Étudiant(e) · ${student.matricule}`;
        document.querySelector('.subtitle').textContent = `Bienvenue ${student.prenom}, voici votre résumé`;
    }

    // 2. Notes, moyenne, absences, matières
    console.log('[dashboard-etudiant] Récupération données académiques');
    let gradesData, averageData, absencesData, subjectsData;
    
    if (currentUser.role === 'admin') {
        console.log('[dashboard-etudiant] Admin - récupération données globales');
        // Pour l'admin, on récupère toutes les données globales
        [gradesData, absencesData, subjectsData] = await Promise.all([
            apiFetch('/grades'),
            apiFetch('/absences'),
            apiFetch('/subjects')
        ]);
        console.log('[dashboard-etudiant] Admin - données reçues:', { grades: gradesData?.length, absences: absencesData?.length, subjects: subjectsData?.length });
        // Calculer la moyenne globale
        const grades = Array.isArray(gradesData) ? gradesData : [];
        const total = grades.reduce((sum, g) => sum + g.note, 0);
        averageData = grades.length > 0 ? { success: true, moyenne: total / grades.length } : { success: false };
    } else {
        console.log('[dashboard-etudiant] Étudiant - récupération données personnelles, student.id:', student.id);
        // Pour l'étudiant, on récupère ses données personnelles
        [gradesData, averageData, absencesData, subjectsData] = await Promise.all([
            apiFetch(`/grades/student/${student.id}`),
            apiFetch(`/grades/student/${student.id}/average`),
            apiFetch(`/absences/student/${student.id}`),
            apiFetch('/subjects')
        ]);
        console.log('[dashboard-etudiant] Étudiant - données reçues:', { grades: gradesData?.length, average: averageData, absences: absencesData?.length, subjects: subjectsData?.length });
    }

    const subjectsById = {};
    if (Array.isArray(subjectsData)) {
        subjectsData.forEach(s => { subjectsById[s.id] = s.nom; });
    }
    console.log('[dashboard-etudiant] Mapping matières:', subjectsById);

    const grades = Array.isArray(gradesData) ? gradesData : [];
    const absences = Array.isArray(absencesData) ? absencesData : [];
    console.log('[dashboard-etudiant] Données finales:', { gradesCount: grades.length, absencesCount: absences.length });

    // Cartes
    const cards = document.querySelectorAll('.card-number');
    const notesEl = document.querySelectorAll('.card-note');

    cards[0].textContent = averageData.success ? Number(averageData.moyenne).toFixed(1) : '—';

    const matieresSuivies = new Set(grades.map(g => g.subject_id)).size;
    cards[1].textContent = matieresSuivies;

    cards[2].textContent = absences.length;
    const justifiees = absences.filter(a => a.status === 'justifiée').length;
    const nonJustifiees = absences.length - justifiees;
    notesEl[2].textContent = `${justifiees} justifiée(s), ${nonJustifiees} non justifiée(s)`;

    if (grades.length > 0) {
        const derniere = grades[grades.length - 1];
        cards[3].textContent = `${derniere.note}/20`;
        notesEl[3].textContent = `${subjectsById[derniere.subject_id] || 'Matière'}`;
    } else {
        cards[3].textContent = '—';
        notesEl[3].textContent = 'Aucune note pour le moment';
    }

    // Tableau des notes
    const tbody = document.querySelector('table tbody');
    tbody.innerHTML = '';

    if (grades.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4">Aucune note enregistrée pour le moment.</td></tr>';
        return;
    }

    grades.slice().reverse().forEach(g => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${subjectsById[g.subject_id] || 'Matière'}</td>
            <td><span class="note-value ${noteClass(g.note)}">${g.note}/20</span></td>
            <td>—</td>
            <td>—</td>
        `;
        tbody.appendChild(tr);
    });
}

chargerDashboardEtudiant();
