const token = localStorage.getItem('token');
const currentUser = JSON.parse(localStorage.getItem('user') || 'null');

if (!token || !currentUser) {
    window.location.href = '/login.html';
}

// Garde de rôle : seul l'admin peut accéder à cette page, même si l'URL est tapée directement
const REDIRECT_BY_ROLE = {
    admin: '/dashboard-admin',
    teacher: '/dashboard-prof',
    student: '/dashboard-etudiant'
};
if (currentUser.role !== 'admin') {
    window.location.href = REDIRECT_BY_ROLE[currentUser.role] || '/login.html';
}

document.querySelector('.user-name').textContent = currentUser.name || currentUser.email;
document.querySelector('.user-role').textContent = 'Administrateur';

document.querySelector('.logout-btn').addEventListener('click', async () => {
    await apiFetch('/auth/logout', { method: 'POST' });
    localStorage.clear();
    window.location.href = '/login.html';
});

const formPanel = document.getElementById('formPanel');
const userForm = document.getElementById('userForm');
const toggleFormBtn = document.getElementById('toggleFormBtn');
const cancelFormBtn = document.getElementById('cancelFormBtn');
const nomInput = document.getElementById('nomUser');
const emailInput = document.getElementById('emailUser');
const passwordInput = document.getElementById('passwordUser');
const roleSelect = document.getElementById('roleUser');
const searchInput = document.getElementById('searchInput');
const roleFilter = document.getElementById('roleFilter');
const tbody = document.querySelector('#usersTable tbody');

let users = [];

const ROLE_LABELS = { admin: 'Administrateur', teacher: 'Professeur', student: 'Étudiant' };
const ROLE_BADGE = { admin: 'badge-danger', teacher: 'badge-success', student: 'badge-success' };

function ouvrirFormulaire() {
    formPanel.classList.add('open');
}

function fermerFormulaire() {
    formPanel.classList.remove('open');
    userForm.reset();
}

toggleFormBtn.addEventListener('click', ouvrirFormulaire);
cancelFormBtn.addEventListener('click', fermerFormulaire);

async function chargerUtilisateurs() {
    const data = await apiFetch('/users');
    users = Array.isArray(data) ? data : [];
    afficherUtilisateurs();
}

function afficherUtilisateurs() {
    const recherche = searchInput.value.trim().toLowerCase();
    const filtreRole = roleFilter.value;

    const filtres = users.filter(u => {
        const matchRecherche = !recherche
            || u.name.toLowerCase().includes(recherche)
            || u.email.toLowerCase().includes(recherche);
        const matchRole = !filtreRole || u.role === filtreRole;
        return matchRecherche && matchRole;
    });

    tbody.innerHTML = '';

    if (filtres.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4">Aucun utilisateur trouvé.</td></tr>';
        return;
    }

    filtres.forEach(u => {
        const tr = document.createElement('tr');
        const estMoi = u.id === currentUser.id;
        tr.innerHTML = `
            <td>${u.name}</td>
            <td>${u.email}</td>
            <td><span class="badge ${ROLE_BADGE[u.role] || 'badge-success'}">${ROLE_LABELS[u.role] || u.role}</span></td>
            <td>
                <div class="row-actions">
                    <button class="icon-btn delete" title="${estMoi ? 'Impossible de supprimer votre propre compte' : 'Supprimer'}" data-id="${u.id}" ${estMoi ? 'disabled' : ''}>
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });

    tbody.querySelectorAll('.icon-btn.delete:not([disabled])').forEach(btn => {
        btn.addEventListener('click', () => supprimerClic(Number(btn.dataset.id)));
    });
}

async function supprimerClic(id) {
    if (!confirm('Supprimer cet utilisateur ? Cette action est irréversible.')) return;
    const res = await apiFetch(`/users/${id}`, { method: 'DELETE' });
    if (res.success) {
        users = users.filter(u => u.id !== id);
        afficherUtilisateurs();
    } else {
        alert(res.error || 'Erreur lors de la suppression.');
    }
}

userForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const payload = {
        name: nomInput.value.trim(),
        email: emailInput.value.trim(),
        mot_passe: passwordInput.value,
        role: roleSelect.value
    };

    if (!payload.role) {
        alert('Veuillez sélectionner un rôle.');
        return;
    }

    const res = await apiFetch('/users', { method: 'POST', body: JSON.stringify(payload) });

    if (res.success) {
        fermerFormulaire();
        await chargerUtilisateurs();
    } else {
        alert(res.error || "Erreur lors de la création de l'utilisateur.");
    }
});

searchInput.addEventListener('input', afficherUtilisateurs);
roleFilter.addEventListener('change', afficherUtilisateurs);

chargerUtilisateurs();
