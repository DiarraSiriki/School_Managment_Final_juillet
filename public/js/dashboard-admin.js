const ROLE_LABELS = {
  admin: 'Administrateur',
  teacher: 'Professeur',
  student: 'Étudiant'
};

const ROLE_BADGE_CLASS = {
  admin: 'badge-purple',
  teacher: 'badge-blue',
  student: 'badge-green'
};

const ROLE_AVATAR_CLASS = {
  admin: 'purple-bg',
  teacher: 'blue-bg',
  student: 'green-bg'
};

let allUsers = [];
let currentFilter = 'all';
let searchTerm = '';

// Mettre à jour le nom de l'utilisateur connecté
function updateCurrentUserDisplay() {
  const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
  if (currentUser) {
    const userNameEl = document.querySelector('.user-name');
    const userRoleEl = document.querySelector('.user-role');
    if (userNameEl) userNameEl.textContent = currentUser.name || currentUser.email || '';
    if (userRoleEl) userRoleEl.textContent = ROLE_LABELS[currentUser.role] || '';
  }
}



function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str ?? '';
  return div.innerHTML;
}

function getInitials(name) {
  if (typeof AuthGuard !== 'undefined' && AuthGuard.getInitials) {
    return AuthGuard.getInitials(name);
  }
  if (!name) return '?';
  return name.trim().split(/\s+/).slice(0, 2).map(p => p[0]?.toUpperCase() || '').join('') || '?';
}

function showAlert(message, type = 'success') {
  const box = document.getElementById('alertBox');
  if (!box) return;
  box.textContent = message;
  box.className = `alert-box show alert-${type}`;
  clearTimeout(showAlert._timer);
  showAlert._timer = setTimeout(() => {
    box.classList.remove('show');
  }, 3500);
}

// --- Chargement des données ---

async function loadUsers() {
  try {
    const users = await API.admin.getUsers();
    allUsers = Array.isArray(users) ? users : [];
    renderStats();
    renderTable();
  } catch (error) {
    document.getElementById('usersTableBody').innerHTML =
      `<tr class="table-state-row"><td colspan="4">Impossible de charger les utilisateurs. ${escapeHtml(error.message)}</td></tr>`;
    showAlert("Erreur lors du chargement des utilisateurs.", 'error');
  }
}

function renderStats() {
  const counts = { admin: 0, teacher: 0, student: 0 };
  allUsers.forEach(u => {
    if (counts[u.role] !== undefined) counts[u.role]++;
  });

  document.getElementById('statAdmin').textContent = counts.admin;
  document.getElementById('statProf').textContent = counts.teacher;
  document.getElementById('statEtudiant').textContent = counts.student;

  const total = allUsers.length;
  const subtitle = document.getElementById('userCountSubtitle');
  subtitle.textContent = `${total} compte${total > 1 ? 's' : ''} · ${counts.admin} admin, ${counts.teacher} prof, ${counts.student} étudiant${counts.student > 1 ? 's' : ''}`;
}

function getFilteredUsers() {
  return allUsers.filter(u => {
    const matchesRole = currentFilter === 'all' || u.role === currentFilter;
    if (!matchesRole) return false;

    if (!searchTerm) return true;
    const haystack = `${u.name || ''} ${u.email || ''}`.toLowerCase();
    return haystack.includes(searchTerm);
  });
}

function renderTable() {
  const tbody = document.getElementById('usersTableBody');
  const users = getFilteredUsers();

  if (users.length === 0) {
    tbody.innerHTML = `<tr class="table-state-row"><td colspan="4">Aucun utilisateur ne correspond à cette recherche.</td></tr>`;
    return;
  }

  tbody.innerHTML = users.map(u => {
    const initials = getInitials(u.name);
    const avatarClass = ROLE_AVATAR_CLASS[u.role] || 'blue-bg';
    const badgeClass = ROLE_BADGE_CLASS[u.role] || 'badge-blue';
    const roleLabel = ROLE_LABELS[u.role] || u.role;

    return `
      <tr>
        <td class="user-cell">
          <div class="circle-avatar ${avatarClass}">${escapeHtml(initials)}</div>
          <div>
            <strong>${escapeHtml(u.name)}</strong><br>
            <small>ID-${escapeHtml(String(u.id))}</small>
          </div>
        </td>
        <td>${escapeHtml(u.email)}</td>
        <td><span class="badge ${badgeClass}">${escapeHtml(roleLabel)}</span></td>
        <td>
          <button class="btn-edit" data-action="edit" data-id="${u.id}"><i class="fa-regular fa-pen-to-square"></i> Modifier</button>
          <button class="btn-delete" data-action="delete" data-id="${u.id}"><i class="fa-regular fa-trash-can"></i> Supprimer</button>
        </td>
      </tr>
    `;
  }).join('');
}

// --- Filtres et recherche ---

function setupSearch() {
  document.getElementById('filterButtons').addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-filter');
    if (!btn) return;

    document.querySelectorAll('.btn-filter').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.role;
    renderTable();
  });

  document.getElementById('searchInput').addEventListener('input', (e) => {
    searchTerm = e.target.value.trim().toLowerCase();
    renderTable();
  });
}

// --- Modale (création / modification) ---

const modal = () => document.getElementById('userModal');

function openCreateModal() {
  document.getElementById('modalTitle').textContent = 'Nouvel utilisateur';
  document.getElementById('modalSubtitle').textContent = 'Créer un compte administrateur, professeur ou étudiant.';
  document.getElementById('userForm').reset();
  document.getElementById('userId').value = '';
  document.getElementById('userPassword').required = true;
  document.getElementById('passwordHint').textContent = 'Requis à la création.';
  hideFormError();
  modal().classList.add('show');
}

function openEditModal(user) {
  document.getElementById('modalTitle').textContent = 'Modifier l\'utilisateur';
  document.getElementById('modalSubtitle').textContent = `${user.name} · ${ROLE_LABELS[user.role] || user.role}`;
  document.getElementById('userId').value = user.id;
  document.getElementById('userName').value = user.name || '';
  document.getElementById('userEmail').value = user.email || '';
  const roleToSet = user.role || 'student';
  const roleRadio = document.querySelector(`input[name="userRole"][value="${roleToSet}"]`);
  if (roleRadio) roleRadio.checked = true;
  document.getElementById('userPassword').value = '';
  document.getElementById('userPassword').required = false;
  document.getElementById('passwordHint').textContent = 'Laisser vide pour conserver le mot de passe actuel.';
  hideFormError();
  modal().classList.add('show');
}

function closeModal() {
  modal().classList.remove('show');
}

function showFormError(message) {
  const box = document.getElementById('formError');
  box.textContent = message;
  box.classList.add('show');
}

function hideFormError() {
  const box = document.getElementById('formError');
  box.textContent = '';
  box.classList.remove('show');
}

function setupModal() {
  document.getElementById('btnNewUser').addEventListener('click', openCreateModal);
  document.getElementById('btnCancelModal').addEventListener('click', closeModal);
  modal().addEventListener('click', (e) => {
    if (e.target === modal()) closeModal();
  });

  document.getElementById('userForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    hideFormError();

    const id = document.getElementById('userId').value;
    const name = document.getElementById('userName').value.trim();
    const email = document.getElementById('userEmail').value.trim();
    const roleRadio = document.querySelector('input[name="userRole"]:checked');
    const role = roleRadio ? roleRadio.value : '';
    const mot_passe = document.getElementById('userPassword').value;

    const submitBtn = document.getElementById('btnSubmitModal');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Enregistrement...';

    try {
      if (id) {
        const payload = { name, email, role };
        if (mot_passe) payload.mot_passe = mot_passe;
        await API.admin.updateUser(id, payload);
        showAlert('Utilisateur modifié avec succès.');
      } else {
        await API.admin.createUser({ name, email, role, mot_passe });
        showAlert('Utilisateur créé avec succès.');
      }
      closeModal();
      await loadUsers();
    } catch (error) {
      showFormError(error.message || "Une erreur est survenue.");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Enregistrer';
    }
  });
}

// --- Actions sur les lignes (édition / suppression) ---

function setupTableActions() {
  document.getElementById('usersTableBody').addEventListener('click', async (e) => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;

    const id = btn.dataset.id;
    const user = allUsers.find(u => String(u.id) === String(id));
    if (!user) return;

    if (btn.dataset.action === 'edit') {
      openEditModal(user);
      return;
    }

    if (btn.dataset.action === 'delete') {
      const currentUser = (typeof AuthGuard !== 'undefined') ? AuthGuard.getUser() : null;
      if (currentUser && String(currentUser.id) === String(user.id)) {
        showAlert("Vous ne pouvez pas supprimer votre propre compte.", 'error');
        return;
      }

      if (!confirm(`Supprimer définitivement ${user.name} ?`)) return;

      try {
        await API.admin.deleteUser(id);
        showAlert('Utilisateur supprimé.');
        await loadUsers();
      } catch (error) {
        showAlert(`Échec de la suppression : ${error.message}`, 'error');
      }
    }
  });
}



function renderTodayDate() {
  const el = document.getElementById('topDateText');
  if (!el) return;
  const formatted = new Date().toLocaleDateString('fr-FR', {
    weekday: 'short', day: 'numeric', month: 'long', year: 'numeric'
  });
  el.textContent = formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

document.addEventListener('DOMContentLoaded', () => {
  renderTodayDate();
  updateCurrentUserDisplay();
  setupSearch();
  setupModal();
  setupTableActions();
  loadUsers();

  // Setup logout button
  const logoutBtn = document.querySelector('.logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await API.auth.logout();
    });
  }
});