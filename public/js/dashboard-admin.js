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
let allClasses = [];
let currentFilter = 'all';
let searchTerm = '';

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

// --- Dynamic Role Fields Manager ---

function updateRoleFields(role) {
  const studentGroup = document.getElementById('studentFieldsGroup');
  const teacherGroup = document.getElementById('teacherFieldsGroup');

  const studentClasseSelect = document.getElementById('studentClasseSelect');
  const studentMatriculeInput = document.getElementById('studentMatriculeInput');
  const teacherMatiereInput = document.getElementById('teacherMatiereInput');

  // Masquer tous les groupes optionnels par défaut
  if (studentGroup) studentGroup.style.display = 'none';
  if (teacherGroup) teacherGroup.style.display = 'none';

  // Réinitialiser les validations obligatoires
  if (studentClasseSelect) studentClasseSelect.required = false;
  if (studentMatriculeInput) studentMatriculeInput.required = false;
  if (teacherMatiereInput) teacherMatiereInput.required = false;

  // Afficher et activer les validations selon le rôle coché
  if (role === 'student') {
    if (studentGroup) studentGroup.style.display = 'block';
    if (studentClasseSelect) studentClasseSelect.required = true;
    if (studentMatriculeInput) studentMatriculeInput.required = true;
  } else if (role === 'teacher') {
    if (teacherGroup) teacherGroup.style.display = 'block';
    if (teacherMatiereInput) teacherMatiereInput.required = true;
  }
}

// --- Chargement des données ---

async function loadClasses() {
  try {
    const result = await API.classes.getAll();
    allClasses = Array.isArray(result?.data) ? result.data : (Array.isArray(result) ? result : []);
    const select = document.getElementById('studentClasseSelect');
    if (!select) return;

    select.innerHTML = '<option value="">Sélectionner une classe</option>' +
      allClasses.map(c => `<option value="${c.id}">${escapeHtml(c.nom)}</option>`).join('');
  } catch (error) {
    console.error('[loadClasses]', error);
  }
}

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

  const statAdmin = document.getElementById('statAdmin');
  const statProf = document.getElementById('statProf');
  const statEtudiant = document.getElementById('statEtudiant');

  if (statAdmin) statAdmin.textContent = counts.admin;
  if (statProf) statProf.textContent = counts.teacher;
  if (statEtudiant) statEtudiant.textContent = counts.student;

  const total = allUsers.length;
  const subtitle = document.getElementById('userCountSubtitle');
  if (subtitle) {
    subtitle.textContent = `${total} compte${total > 1 ? 's' : ''} · ${counts.admin} admin, ${counts.teacher} prof, ${counts.student} étudiant${counts.student > 1 ? 's' : ''}`;
  }
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
  if (!tbody) return;

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
          <button class="btn-edit" data-action="edit" data-id="${u.id}" title="Modifier"><i class="fa-regular fa-pen-to-square"></i></button>
          <button class="btn-delete" data-action="delete" data-id="${u.id}" title="Supprimer"><i class="fa-regular fa-trash-can"></i></button>
        </td>
      </tr>
    `;
  }).join('');
}

// --- Filtres et recherche ---

function setupSearch() {
  const filterButtons = document.getElementById('filterButtons');
  if (filterButtons) {
    filterButtons.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn-filter');
      if (!btn) return;

      document.querySelectorAll('.btn-filter').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.role;
      renderTable();
    });
  }

  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchTerm = e.target.value.trim().toLowerCase();
      renderTable();
    });
  }
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

  // Sélectionne 'student' par défaut au premier affichage
  const selectedRoleRadio = document.querySelector('input[name="userRole"]:checked') || 
                             document.querySelector('input[name="userRole"][value="student"]');
  
  if (selectedRoleRadio) {
    selectedRoleRadio.checked = true;
    updateRoleFields(selectedRoleRadio.value);
  } else {
    updateRoleFields('student');
  }

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

  updateRoleFields(roleToSet);

  if (roleToSet === 'student') {
    const select = document.getElementById('studentClasseSelect');
    const matInput = document.getElementById('studentMatriculeInput');
    if (select) select.value = user.classe_id || '';
    if (matInput) matInput.value = user.matricule || '';
  } else if (roleToSet === 'teacher') {
    const matieresInput = document.getElementById('teacherMatiereInput');
    if (matieresInput) matieresInput.value = user.matiere || '';
  }

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
  if (!box) return;
  box.textContent = message;
  box.classList.add('show');
}

function hideFormError() {
  const box = document.getElementById('formError');
  if (!box) return;
  box.textContent = '';
  box.classList.remove('show');
}

function setupModal() {
  const btnNewUser = document.getElementById('btnNewUser') || document.getElementById('btnNewStudent');
  if (btnNewUser) btnNewUser.addEventListener('click', openCreateModal);

  const btnCancel = document.getElementById('btnCancelModal');
  if (btnCancel) btnCancel.addEventListener('click', closeModal);

  if (modal()) {
    modal().addEventListener('click', (e) => {
      if (e.target === modal()) closeModal();
    });
  }

  // Écouteur en direct sur les boutons radio de rôle
  document.querySelectorAll('input[name="userRole"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      updateRoleFields(e.target.value);
    });
  });

  const userForm = document.getElementById('userForm');
  if (userForm) {
    userForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      hideFormError();

      const id = document.getElementById('userId').value;
      const name = document.getElementById('userName').value.trim();
      const email = document.getElementById('userEmail').value.trim();
      const roleRadio = document.querySelector('input[name="userRole"]:checked');
      const role = roleRadio ? roleRadio.value : '';
      const mot_passe = document.getElementById('userPassword').value;

      const payload = { name, email, role };
      if (mot_passe) payload.mot_passe = mot_passe;

      // Construction dynamique du payload selon le rôle
      if (role === 'student') {
        payload.classe_id = document.getElementById('studentClasseSelect')?.value || null;
        payload.matricule = document.getElementById('studentMatriculeInput')?.value.trim() || null;
      } else if (role === 'teacher') {
        payload.matiere = document.getElementById('teacherMatiereInput')?.value.trim() || null;
      }

      const submitBtn = document.getElementById('btnSubmitModal');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Enregistrement...';

      try {
        if (id) {
          await API.admin.updateUser(id, payload);
          showAlert('Utilisateur modifié avec succès.');
        } else {
          await API.admin.createUser(payload);
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
}

// --- Actions sur les lignes ---

function setupTableActions() {
  const tbody = document.getElementById('usersTableBody');
  if (!tbody) return;

  tbody.addEventListener('click', async (e) => {
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

document.addEventListener('DOMContentLoaded', async () => {
  renderTodayDate();
  updateCurrentUserDisplay();
  setupSearch();
  setupModal();
  setupTableActions();

  await loadClasses();
  await loadUsers();

  const logoutBtn = document.querySelector('.logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await API.auth.logout();
    });
  }
});