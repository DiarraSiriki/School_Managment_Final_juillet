
const token = localStorage.getItem('token');
const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
if (!token || !currentUser) {
    window.location.href = '/login.html';
}

document.querySelector('.logout-btn').addEventListener('click', async () => {
    await apiFetch('/auth/logout', { method: 'POST' });
    localStorage.clear();
    window.location.href = '/login.html';
});

const formPanel = document.getElementById('formPanel');
const absenceForm = document.getElementById('absenceForm');
const toggleFormBtn = document.getElementById('toggleFormBtn');
const cancelFormBtn = document.getElementById('cancelFormBtn');
const etudiantSelect = document.getElementById('etudiantAbs');
const matiereSelect = document.getElementById('matiereAbs');
const dateInput = document.getElementById('dateAbs');
const statutSelect = document.getElementById('statutAbs');
const searchInput = document.getElementById('searchInput');
const statutFilter = document.getElementById('statutFilter');
const tbody = document.querySelector('#absencesTable tbody');

let absences = [];
let etudiants = [];
let matieres = [];

// Le backend stocke les statuts en français ("justifiée" / "non justifiée"),
// alors que le formulaire utilise des valeurs simples ("justifiee" / "non-justifiee").
const STATUT_VERS_API = { justifiee: 'justifiée', 'non-justifiee': 'non justifiée' };
const STATUT_DEPUIS_API = { 'justifiée': 'justifiee', 'non justifiée': 'non-justifiee' };

function initiales(prenom, nom) {
    return `${(prenom || '?')[0]}${(nom || '?')[0]}`.toUpperCase();
}

function formatDateFr(isoDate) {
    if (!isoDate) return '';
    const [y, m, d] = isoDate.split('-');
    return `${d}/${m}/${y}`;
}

function ouvrirFormulaire() {
    formPanel.classList.add('open');
}

function fermerFormulaire() {
    formPanel.classList.remove('open');
    absenceForm.reset();
}

toggleFormBtn.addEventListener('click', ouvrirFormulaire);
cancelFormBtn.addEventListener('click', fermerFormulaire);

function remplirSelects() {
    etudiantSelect.innerHTML = '';
    etudiants.forEach(e => {
        const opt = document.createElement('option');
        opt.value = e.id;
        opt.textContent = `${e.prenom} ${e.nom}`;
        etudiantSelect.appendChild(opt);
    });

    matiereSelect.innerHTML = '';
    matieres.forEach(m => {
        const opt = document.createElement('option');
        opt.value = m.id;
        opt.textContent = m.nom;
        matiereSelect.appendChild(opt);
    });
}

async function chargerDonnees() {
    const [absencesData, etudiantsData, matieresData] = await Promise.all([
        apiFetch('/absences'),
        apiFetch('/students'),
        apiFetch('/subjects')
    ]);

    absences = Array.isArray(absencesData) ? absencesData : [];
    etudiants = Array.isArray(etudiantsData) ? etudiantsData : [];
    matieres = Array.isArray(matieresData) ? matieresData : [];

    remplirSelects();
    afficherAbsences();
}

function nomEtudiant(id) {
    const e = etudiants.find(e => e.id === id);
    return e ? `${e.prenom} ${e.nom}` : 'Étudiant inconnu';
}

function afficherAbsences() {
    const recherche = searchInput.value.trim().toLowerCase();
    const filtreStatut = statutFilter.value;

    const filtrees = absences.filter(a => {
        const statutSimple = STATUT_DEPUIS_API[a.status] || a.status;
        const matchRecherche = !recherche || nomEtudiant(a.student_id).toLowerCase().includes(recherche);
        const matchStatut = !filtreStatut || statutSimple === filtreStatut;
        return matchRecherche && matchStatut;
    });

    tbody.innerHTML = '';

    if (filtrees.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5">Aucune absence trouvée.</td></tr>';
        return;
    }

    filtrees.slice().reverse().forEach(a => {
        const etudiant = etudiants.find(e => e.id === a.student_id);
        const statutSimple = STATUT_DEPUIS_API[a.status] || a.status;
        const estJustifiee = statutSimple === 'justifiee';
        const tr = document.createElement('tr');
        tr.dataset.statut = statutSimple;
        tr.innerHTML = `
            <td>
                <div class="user-cell">
                    <div class="avatar">${etudiant ? initiales(etudiant.prenom, etudiant.nom) : '?'}</div>
                    <span>${nomEtudiant(a.student_id)}</span>
                </div>
            </td>
            <td>—</td>
            <td>${formatDateFr(a.date)}</td>
            <td><span class="badge ${estJustifiee ? 'badge-success' : 'badge-danger'}">${estJustifiee ? 'Justifiée' : 'Non justifiée'}</span></td>
            <td>
                <div class="row-actions">
                    <button class="icon-btn" title="${estJustifiee ? 'Marquer non justifiée' : 'Marquer justifiée'}" data-id="${a.id}" data-toggle="1"><i class="fa-solid fa-pen"></i></button>
                    <button class="icon-btn delete" title="Supprimer" data-id="${a.id}"><i class="fa-solid fa-trash"></i></button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });

    tbody.querySelectorAll('.icon-btn[data-toggle]').forEach(btn => {
        btn.addEventListener('click', () => basculerStatut(Number(btn.dataset.id)));
    });
    tbody.querySelectorAll('.icon-btn.delete').forEach(btn => {
        btn.addEventListener('click', () => supprimerClic(Number(btn.dataset.id)));
    });
}

async function basculerStatut(id) {
    const a = absences.find(a => a.id === id);
    if (!a) return;
    const estJustifiee = a.status === 'justifiée';
    const endpoint = estJustifiee ? `/absences/${id}/unjustify` : `/absences/${id}/justify`;
    const res = await apiFetch(endpoint, { method: 'PATCH' });
    if (res.success) {
        await chargerDonnees();
    } else {
        alert(res.error || 'Erreur lors de la mise à jour du statut.');
    }
}

async function supprimerClic(id) {
    if (!confirm('Supprimer cette absence ?')) return;
    const res = await apiFetch(`/absences/${id}`, { method: 'DELETE' });
    if (res.success) {
        absences = absences.filter(a => a.id !== id);
        afficherAbsences();
    } else {
        alert(res.error || 'Erreur lors de la suppression.');
    }
}

absenceForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const payload = {
        student_id: Number(etudiantSelect.value),
        date: dateInput.value,
        status: STATUT_VERS_API[statutSelect.value] || 'non justifiée'
    };

    const res = await apiFetch('/absences', { method: 'POST', body: JSON.stringify(payload) });

    if (res.success) {
        fermerFormulaire();
        await chargerDonnees();
    } else {
        alert(res.error || "Erreur lors de l'enregistrement.");
    }
});

searchInput.addEventListener('input', afficherAbsences);
statutFilter.addEventListener('change', afficherAbsences);

chargerDonnees();
