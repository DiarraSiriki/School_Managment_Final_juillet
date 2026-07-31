
// Garde d'authentification : redirige si pas de token
const token = localStorage.getItem('token');
const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
const REDIRECT_BY_ROLE = {
    admin: '/dashboard-admin',
    teacher: '/dashboard-prof',
    student: '/dashboard-etudiant'
};

if (!token || !currentUser) {
    window.location.replace('/login.html');
} else if (currentUser.role !== 'admin') {
    const redirectUrl = REDIRECT_BY_ROLE[currentUser.role] || '/login.html';
    window.location.replace(redirectUrl);
}

// Affiche le nom/rôle de l'utilisateur connecté dans le pied de sidebar
const ROLE_LABELS = { admin: 'Administrateur', teacher: 'Professeur', student: 'Étudiant' };
document.querySelector('.user-name').textContent = currentUser?.name || currentUser?.email || '';
document.querySelector('.user-role').textContent = ROLE_LABELS[currentUser?.role] || '';

// Déconnexion
document.querySelector('.logout-btn').addEventListener('click', async () => {
    await apiFetch('/auth/logout', { method: 'POST' });
    localStorage.clear();
    window.location.href = '/login.html';
});

// Chargement des cartes de synthèse
async function chargerDashboard() {
    const [statsData, absencesData] = await Promise.all([
        apiFetch('/stats'),
        apiFetch('/stats/absences')
    ]);

    if (!statsData.success) return;

    const cards = document.querySelectorAll('.card-number');
    // Ordre des cartes dans le HTML : Étudiants, Enseignants, Matières, Absences
    cards[0].textContent = statsData.stats.students;
    cards[1].textContent = statsData.stats.teachers;
    cards[2].textContent = statsData.stats.matieres;
    cards[3].textContent = absencesData.success ? absencesData.absences.total : '—';
}

chargerDashboard();
