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
const noteForm = document.getElementById('noteForm');
const toggleFormBtn = document.getElementById('toggleFormBtn');
const cancelFormBtn = document.getElementById('cancelFormBtn');
const etudiantSelect = document.getElementById('etudiantNote');
const matiereSelect = document.getElementById('matiereNote');
const valeurInput = document.getElementById('valeurNote');
const dateInput = document.getElementById('dateNote');
const searchInput = document.getElementById('searchInput');
const matiereFilter = document.getElementById('matiereFilter');
const tbody = document.querySelector('#notesTable tbody');

let notes = [];
let etudiants = [];
let matieres = [];
let editingId = null;

function noteClass(note) {
    if (note >= 14) return 'note-good';
    if (note >= 10) return 'note-medium';
    return 'note-bad';
}

function initiales(prenom, nom) {
    return `${(prenom || '?')[0]}${(nom || '?')[0]}`.toUpperCase();
}

function ouvrirFormulaire(edit = false) {
    formPanel.classList.add('open');
    document.querySelector('#formPanel h3').textContent = edit ? 'Modifier la note' : 'Nouvelle note';
}

function fermerFormulaire() {
    formPanel.classList.remove('open');
    noteForm.reset();
    editingId = null;
    etudiantSelect.disabled = false;
    matiereSelect.disabled = false;
}

toggleFormBtn.addEventListener('click', () => {
    editingId = null;
    ouvrirFormulaire(false);
});
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
    matiereFilter.innerHTML = '<option value="">Toutes les matières</option>';
    matieres.forEach(m => {
        const opt1 = document.createElement('option');
        opt1.value = m.id;
        opt1.textContent = m.nom;
        matiereSelect.appendChild(opt1);

        const opt2 = document.createElement('option');
        opt2.value = m.id;
        opt2.textContent = m.nom;
        matiereFilter.appendChild(opt2);
    });
}

async function chargerDonnees() {
    const [notesData, etudiantsData, matieresData] = await Promise.all([
        apiFetch('/grades'),
        apiFetch('/students'),
        apiFetch('/subjects')
    ]);

    notes = Array.isArray(notesData) ? notesData : [];
    etudiants = Array.isArray(etudiantsData) ? etudiantsData : [];
    matieres = Array.isArray(matieresData) ? matieresData : [];

    remplirSelects();
    afficherNotes();
}

function nomEtudiant(id) {
    const e = etudiants.find(e => e.id === id);
    return e ? `${e.prenom} ${e.nom}` : 'Étudiant inconnu';
}

function nomMatiere(id) {
    const m = matieres.find(m => m.id === id);
    return m ? m.nom : 'Matière inconnue';
}

function afficherNotes() {
    const recherche = searchInput.value.trim().toLowerCase();
    const filtreMatiere = matiereFilter.value;

    const filtrees = notes.filter(n => {
        const matchRecherche = !recherche || nomEtudiant(n.student_id).toLowerCase().includes(recherche);
        const matchMatiere = !filtreMatiere || String(n.subject_id) === filtreMatiere;
        return matchRecherche && matchMatiere;
    });

    tbody.innerHTML = '';

    if (filtrees.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5">Aucune note trouvée.</td></tr>';
        return;
    }

    filtrees.slice().reverse().forEach(n => {
        const etudiant = etudiants.find(e => e.id === n.student_id);
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <div class="user-cell">
                    <div class="avatar">${etudiant ? initiales(etudiant.prenom, etudiant.nom) : '?'}</div>
                    <span>${nomEtudiant(n.student_id)}</span>
                </div>
            </td>
            <td>${nomMatiere(n.subject_id)}</td>
            <td><span class="note-value ${noteClass(n.note)}">${n.note}/20</span></td>
            <td>—</td>
            <td>
                <div class="row-actions">
                    <button class="icon-btn" title="Modifier" data-id="${n.id}"><i class="fa-solid fa-pen"></i></button>
                    <button class="icon-btn delete" title="Supprimer" data-id="${n.id}"><i class="fa-solid fa-trash"></i></button>
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
    const n = notes.find(n => n.id === id);
    if (!n) return;
    editingId = id;
    etudiantSelect.value = n.student_id;
    matiereSelect.value = n.subject_id;
    valeurInput.value = n.note;
    // L'API ne permet de modifier que la valeur de la note (pas l'étudiant/la matière)
    etudiantSelect.disabled = true;
    matiereSelect.disabled = true;
    ouvrirFormulaire(true);
}

async function supprimerClic(id) {
    if (!confirm('Supprimer cette note ?')) return;
    const res = await apiFetch(`/grades/${id}`, { method: 'DELETE' });
    if (res.success) {
        notes = notes.filter(n => n.id !== id);
        afficherNotes();
    } else {
        alert(res.error || 'Erreur lors de la suppression.');
    }
}

noteForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const note = parseFloat(valeurInput.value);

    let res;
    if (editingId) {
        res = await apiFetch(`/grades/${editingId}`, { method: 'PUT', body: JSON.stringify({ note }) });
    } else {
        const payload = {
            student_id: Number(etudiantSelect.value),
            subject_id: Number(matiereSelect.value),
            note
        };
        res = await apiFetch('/grades', { method: 'POST', body: JSON.stringify(payload) });
    }

    if (res.success) {
        fermerFormulaire();
        await chargerDonnees();
    } else {
        alert(res.error || "Erreur lors de l'enregistrement.");
    }
});

searchInput.addEventListener('input', afficherNotes);
matiereFilter.addEventListener('change', afficherNotes);

chargerDonnees();
