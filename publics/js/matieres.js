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
const matiereForm = document.getElementById('matiereForm');
const toggleFormBtn = document.getElementById('toggleFormBtn');
const cancelFormBtn = document.getElementById('cancelFormBtn');
const nomInput = document.getElementById('nomMatiere');
const coefInput = document.getElementById('coefMatiere');
const classeInput = document.getElementById('classeMatiere');
const profSelect = document.getElementById('profMatiere');
const searchInput = document.getElementById('searchInput');
const profFilter = document.getElementById('profFilter');
const tbody = document.querySelector('#matieresTable tbody');

let matieres = [];
let professeurs = [];
let notes = [];
let editingId = null;

function ouvrirFormulaire(edit = false) {
    formPanel.classList.add('open');
    document.querySelector('#formPanel h3').textContent = edit ? 'Modifier la matière' : 'Nouvelle matière';
}

function fermerFormulaire() {
    formPanel.classList.remove('open');
    matiereForm.reset();
    editingId = null;
}

toggleFormBtn.addEventListener('click', () => {
    editingId = null;
    ouvrirFormulaire(false);
});
cancelFormBtn.addEventListener('click', fermerFormulaire);

function remplirSelectProfs(select, avecOptionVide = true) {
    select.innerHTML = avecOptionVide ? '<option value="">Tous les enseignants</option>' : '';
    professeurs.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.id;
        opt.textContent = p.nom;
        select.appendChild(opt);
    });
}

async function chargerDonnees() {
    const [matieresData, profsData, notesData] = await Promise.all([
        apiFetch('/subjects'),
        apiFetch('/teachers'),
        apiFetch('/grades')
    ]);

    matieres = Array.isArray(matieresData) ? matieresData : [];
    professeurs = Array.isArray(profsData) ? profsData : [];
    notes = Array.isArray(notesData) ? notesData : [];

    remplirSelectProfs(profSelect, false);
    remplirSelectProfs(profFilter, true);

    afficherMatieres();
}

function nomProf(teacher_id) {
    const p = professeurs.find(p => p.id === teacher_id);
    return p ? p.nom : '—';
}

function afficherMatieres() {
    const recherche = searchInput.value.trim().toLowerCase();
    const filtreProf = profFilter.value;

    const filtrees = matieres.filter(m => {
        const matchRecherche = !recherche || m.nom.toLowerCase().includes(recherche);
        const matchProf = !filtreProf || String(m.teacher_id) === filtreProf;
        return matchRecherche && matchProf;
    });

    tbody.innerHTML = '';

    if (filtrees.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5">Aucune matière trouvée.</td></tr>';
        return;
    }

    filtrees.forEach(m => {
        const nbEtudiants = new Set(notes.filter(n => n.subject_id === m.id).map(n => n.student_id)).size;
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${m.nom}</td>
            <td>${m.classe}</td>
            <td>${nomProf(m.teacher_id)}</td>
            <td>${nbEtudiants}</td>
            <td>
                <div class="row-actions">
                    <button class="icon-btn" title="Modifier" data-id="${m.id}"><i class="fa-solid fa-pen"></i></button>
                    <button class="icon-btn delete" title="Supprimer" data-id="${m.id}"><i class="fa-solid fa-trash"></i></button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });

    tbody.querySelectorAll('.icon-btn:not(.delete)').forEach(btn => {
        btn.addEventListener('click', () => modifierClic(Number(btn.dataset.id)));
    });
    tbody.querySelectorAll('.icon-btn.delete').forEach(btn => {
        btn.addEventListener('click', () => supprimerClic(Number(btn.dataset.id)));
    });
}

function modifierClic(id) {
    const m = matieres.find(m => m.id === id);
    if (!m) return;
    editingId = id;
    nomInput.value = m.nom;
    coefInput.value = 1;
    classeInput.value = m.classe || '';
    profSelect.value = m.teacher_id || '';
    ouvrirFormulaire(true);
}

async function supprimerClic(id) {
    if (!confirm('Supprimer cette matière ?')) return;
    const res = await apiFetch(`/subjects/${id}`, { method: 'DELETE' });
    if (res.success) {
        matieres = matieres.filter(m => m.id !== id);
        afficherMatieres();
    } else {
        alert(res.error || 'Erreur lors de la suppression.');
    }
}

matiereForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const payload = {
        nom: nomInput.value.trim(),
        classe: classeInput.value.trim(),
        teacher_id: profSelect.value ? Number(profSelect.value) : null
    };

    let res;
    if (editingId) {
        res = await apiFetch(`/subjects/${editingId}`, { method: 'PUT', body: JSON.stringify(payload) });
    } else {
        res = await apiFetch('/subjects', { method: 'POST', body: JSON.stringify(payload) });
    }

    if (res.success) {
        fermerFormulaire();
        await chargerDonnees();
    } else {
        alert(res.error || "Erreur lors de l'enregistrement.");
    }
});

searchInput.addEventListener('input', afficherMatieres);
profFilter.addEventListener('change', afficherMatieres);

chargerDonnees();
