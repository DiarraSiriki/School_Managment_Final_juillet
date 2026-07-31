const token = localStorage.getItem('token');
const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
if (!token || !currentUser) {
    window.location.href = '/login.html';
}

const ROLE_LABELS = { admin: 'Administrateur', teacher: 'Professeur', student: 'Étudiant' };
document.querySelector('.user-name').textContent = currentUser?.name || currentUser?.email || '';
document.querySelector('.user-role').textContent = ROLE_LABELS[currentUser?.role] || '';

document.querySelector('.logout-btn').addEventListener('click', async () => {
    await apiFetch('/auth/logout', { method: 'POST' });
    localStorage.clear();
    window.location.href = '/login.html';
});

const COLORS = ['#4f7cff', '#1fa860', '#c98a1c', '#e5484d', '#8a63d2', '#0eb0c9'];

async function chargerStatistiques() {
    const [statsData, absencesGlobales, rankings, subjects, absencesHistorique, grades] = await Promise.all([
        apiFetch('/stats'),
        apiFetch('/stats/absences'),
        apiFetch('/stats/rankings'),
        apiFetch('/subjects'),
        apiFetch('/absences'),
        apiFetch('/grades')
    ]);

    // Cartes de synthèse
    if (statsData.success) {
        const cards = document.querySelectorAll('.card-number');
        cards[0].textContent = statsData.stats.students;
        cards[1].textContent = statsData.stats.teachers;
        cards[2].textContent = statsData.stats.matieres;
        cards[3].textContent = absencesGlobales.success ? absencesGlobales.absences.total : '—';
    }

    // Graphique 1 : moyenne par matière (calculée à partir des notes de chaque étudiant classé)
    if (Array.isArray(rankings)) {
        // Regroupe les moyennes des étudiants pour donner une vue par matière n'est pas
        // possible directement (les notes ne sont pas exposées groupées par matière côté API),
        // on affiche donc la moyenne de chaque étudiant classé comme approximation utile.
        new Chart(document.getElementById('moyenneChart'), {
            type: 'bar',
            data: {
                labels: rankings.map(r => `${r.prenom} ${r.nom}`),
                datasets: [{
                    label: 'Moyenne /20',
                    data: rankings.map(r => parseFloat(r.moyenne)),
                    backgroundColor: COLORS[0]
                }]
            },
            options: { responsive: true, scales: { y: { beginAtZero: true, max: 20 } } }
        });
    }

    // Graphique 2 : répartition des absences justifiées / non justifiées
    if (absencesGlobales.success) {
        new Chart(document.getElementById('absencesChart'), {
            type: 'doughnut',
            data: {
                labels: ['Justifiées', 'Non justifiées'],
                datasets: [{
                    data: [absencesGlobales.absences.justifiees, absencesGlobales.absences.non_justifiees],
                    backgroundColor: [COLORS[1], COLORS[3]]
                }]
            },
            options: { responsive: true }
        });
    }

    // Graphique 3 : évolution des absences par mois
    if (Array.isArray(absencesHistorique)) {
        const parMois = {};
        absencesHistorique.forEach(a => {
            const mois = (a.date || '').slice(0, 7); // YYYY-MM
            if (!mois) return;
            parMois[mois] = (parMois[mois] || 0) + 1;
        });
        const moisTries = Object.keys(parMois).sort();
        new Chart(document.getElementById('evolutionChart'), {
            type: 'line',
            data: {
                labels: moisTries,
                datasets: [{
                    label: 'Absences',
                    data: moisTries.map(m => parMois[m]),
                    borderColor: COLORS[2],
                    backgroundColor: COLORS[2],
                    tension: 0.3
                }]
            },
            options: { responsive: true }
        });
    }

    // Graphique 4 : étudiants par matière (nombre d'étudiants distincts ayant une note dans chaque matière)
    if (Array.isArray(subjects) && Array.isArray(grades)) {
        const etudiantsParMatiere = subjects.map(s => {
            const ids = new Set(grades.filter(g => g.subject_id === s.id).map(g => g.student_id));
            return ids.size;
        });
        new Chart(document.getElementById('effectifsChart'), {
            type: 'pie',
            data: {
                labels: subjects.map(s => s.nom),
                datasets: [{
                    data: etudiantsParMatiere,
                    backgroundColor: subjects.map((_, i) => COLORS[i % COLORS.length])
                }]
            },
            options: { responsive: true }
        });
    }
}

chargerStatistiques();
