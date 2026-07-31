const token = localStorage.getItem('token');
const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
const REDIRECT_BY_ROLE = {
    admin: '/dashboard-admin',
    teacher: '/dashboard-prof',
    student: '/dashboard-etudiant'
};

if (!token || !currentUser) {
    window.location.replace('/login.html');
} else if (currentUser.role !== 'teacher' && currentUser.role !== 'admin') {
    const redirectUrl = REDIRECT_BY_ROLE[currentUser.role] || '/login.html';
    window.location.replace(redirectUrl);
}

document.querySelector('.logout-btn').addEventListener('click', async () => {
    await apiFetch('/auth/logout', { method: 'POST' });
    localStorage.clear();
    window.location.href = '/login.html';
});

function noteClass(note) {
    if (note >= 14) return 'note-good';
    if (note >= 10) return 'note-medium';
    return 'note-bad';
}

function initiales(prenom, nom) {
    return `${(prenom || '?')[0]}${(nom || '?')[0]}`.toUpperCase();
}

async function chargerDashboardProf() {
    // 1. Fiche professeur liée au compte connecté (ou tous les professeurs pour l'admin)
    let teacher;
    let allTeachers = [];
    
    if (currentUser.role === 'admin') {
        // Pour l'admin, on récupère tous les professeurs et on affiche une vue globale
        allTeachers = await apiFetch('/teachers');
        if (!Array.isArray(allTeachers) || allTeachers.length === 0) {
            console.error('[dashboard-prof]', 'Aucun professeur trouvé');
            return;
        }
        // Afficher les infos admin
        document.querySelector('.user-name').textContent = currentUser.name || currentUser.email;
        document.querySelector('.user-role').textContent = 'Administrateur · Vue globale professeurs';
    } else {
        // Pour le professeur, on récupère son propre profil
        teacher = await apiFetch('/teachers/me');
        if (teacher.error) {
            console.error('[dashboard-prof]', teacher.error);
            return;
        }
        document.querySelector('.user-name').textContent = teacher.nom;
        document.querySelector('.user-role').textContent = 'Professeur';
    }

    // 2. Données nécessaires : matières, étudiants, notes, absences (ce mois-ci)
    const [subjectsData, studentsData, gradesData, absencesData] = await Promise.all([
        apiFetch('/subjects'),
        apiFetch('/students'),
        apiFetch('/grades'),
        apiFetch('/absences')
    ]);

    const mesMatieres = Array.isArray(subjectsData)
        ? (currentUser.role === 'admin' ? subjectsData : subjectsData.filter(s => s.teacher_id === teacher.id))
        : [];
    const mesMatiereIds = new Set(mesMatieres.map(s => s.id));

    const studentsById = {};
    if (Array.isArray(studentsData)) {
        studentsData.forEach(s => { studentsById[s.id] = s; });
    }

    // Notes concernant uniquement mes matières
    const mesNotes = Array.isArray(gradesData)
        ? gradesData.filter(g => mesMatiereIds.has(g.subject_id))
        : [];

    // Cartes
    const cards = document.querySelectorAll('.card-number');
    const notesEl = document.querySelectorAll('.card-note');

    cards[0].textContent = mesMatieres.length;
    notesEl[0].textContent = mesMatieres.map(m => m.nom).join(', ') || 'Aucune matière assignée';

    cards[1].textContent = Array.isArray(studentsData) ? studentsData.length : 0;

    cards[2].textContent = mesNotes.length;

    // Absences ce mois-ci (toutes matières confondues, l'API ne lie pas absence <-> matière)
    const moisActuel = new Date().toISOString().slice(0, 7);
    const absencesCeMois = Array.isArray(absencesData)
        ? absencesData.filter(a => (a.date || '').startsWith(moisActuel))
        : [];
    cards[3].textContent = absencesCeMois.length;

    // Tableau des dernières notes ajoutées dans mes matières
    const tbody = document.querySelector('table tbody');
    tbody.innerHTML = '';

    const dernieresNotes = mesNotes.slice().reverse().slice(0, 10);

    if (dernieresNotes.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4">Aucune note ajoutée pour le moment.</td></tr>';
        return;
    }

    dernieresNotes.forEach(g => {
        const etudiant = studentsById[g.student_id];
        const matiere = mesMatieres.find(m => m.id === g.subject_id);
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <div class="user-cell">
                    <div class="avatar">${etudiant ? initiales(etudiant.prenom, etudiant.nom) : '?'}</div>
                    <span>${etudiant ? `${etudiant.prenom} ${etudiant.nom}` : 'Étudiant inconnu'}</span>
                </div>
            </td>
            <td>${matiere ? matiere.nom : 'Matière'}</td>
            <td><span class="note-value ${noteClass(g.note)}">${g.note}/20</span></td>
            <td>—</td>
        `;
        tbody.appendChild(tr);
    });
}

chargerDashboardProf();
