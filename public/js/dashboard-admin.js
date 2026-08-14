document.addEventListener('DOMContentLoaded', () => {

  let tousLesUtilisateurs = [];
  let currentSearch = '';
  let currentFilter = '';

  const tableBody = document.getElementById('tbodyUsers');
  const searchInput = document.getElementById('searchUsersInput');
  const filterBtns = document.querySelectorAll('.filter-btn');

  const ROLE_LABELS = { admin: 'Administrateur', teacher: 'Professeur', student: 'Étudiant' };
  const ROLE_BADGE_CLASS = { admin: 'role-admin', teacher: 'role-prof', student: 'role-etud' };
  const AVATAR_COLORS = { admin: 'purple', teacher: 'blue', student: 'green' };

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str ?? '';
    return div.innerHTML;
  }

  function getInitiales(nom) {
    const parts = (nom || '?').trim().split(' ');
    return parts.length > 1
      ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      : `${parts[0][0]}${parts[0][1] || ''}`.toUpperCase();
  }

  // ==========================================
  // 1. CHARGEMENT DES UTILISATEURS DEPUIS L'API
  // ==========================================
  async function chargerUtilisateurs() {
    try {
      const users = await API.admin.getUsers();
      tousLesUtilisateurs = users;
      mettreAJourStats(users);
      afficherUtilisateurs();
    } catch (error) {
      console.error('Erreur chargement utilisateurs:', error);
      tableBody.innerHTML = `<tr><td colspan="4">Erreur de chargement : ${escapeHtml(error.message)}</td></tr>`;
    }
  }

  function mettreAJourStats(users) {
    document.getElementById('statAdmins').textContent = users.filter(u => u.role === 'admin').length;
    document.getElementById('statTeachers').textContent = users.filter(u => u.role === 'teacher').length;
    document.getElementById('statStudents').textContent = users.filter(u => u.role === 'student').length;
    document.querySelector('.subtitle').textContent = `${users.length} compte(s)`;
  }

  // ==========================================
  // 2. AFFICHAGE / FILTRAGE DU TABLEAU
  // ==========================================
  function afficherUtilisateurs() {
    const recherche = currentSearch.toLowerCase();

    const filtres = tousLesUtilisateurs.filter(u => {
      const matchRole = !currentFilter || u.role === currentFilter;
      const matchRecherche = !recherche ||
        (u.name || '').toLowerCase().includes(recherche) ||
        (u.email || '').toLowerCase().includes(recherche);
      return matchRole && matchRecherche;
    });

    if (filtres.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="4">Aucun utilisateur trouvé.</td></tr>`;
      return;
    }

    tableBody.innerHTML = filtres.map(u => `
      <tr>
        <td>
          <div class="user-cell">
            <div class="avatar ${AVATAR_COLORS[u.role] || 'blue'}">${getInitiales(u.name)}</div>
            <div>
              <div class="user-name">${escapeHtml(u.name)}</div>
              <div class="user-id">${escapeHtml(u.matricule || ('USR-' + u.id))}</div>
            </div>
          </div>
        </td>
        <td>${escapeHtml(u.email)}</td>
        <td><span class="role-badge ${ROLE_BADGE_CLASS[u.role] || ''}">${ROLE_LABELS[u.role] || u.role}</span></td>
        <td>
          <button class="btn-secondary" style="padding:6px 10px;" title="Supprimer" onclick="supprimerUtilisateur(${u.id})">
            <i class="fa-solid fa-trash"></i>
          </button>
        </td>
      </tr>
    `).join('');
  }

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentSearch = e.target.value.trim();
      afficherUtilisateurs();
    });
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.getAttribute('data-role') || '';
      afficherUtilisateurs();
    });
  });

  // ==========================================
  // 3. SUPPRESSION D'UN UTILISATEUR
  // ==========================================
  window.supprimerUtilisateur = async function (id) {
    if (!confirm('Supprimer définitivement cet utilisateur ?')) return;
    try {
      await API.admin.deleteUser(id);
      chargerUtilisateurs();
    } catch (error) {
      alert(`Échec de la suppression : ${error.message}`);
    }
  };

  // ==========================================
  // 4. INJECTION HTML DE LA MODALE D'AJOUT
  // ==========================================
  const modalHTML = `
    <div class="modal-overlay" id="userModal">
      <div class="modal">
        <div class="modal-header">
          <h3>Nouvel Utilisateur</h3>
          <button class="modal-close" id="closeModalBtn"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <form id="addUserForm">
          <div class="modal-body">
            <div class="form-group">
              <label for="userName">Nom complet</label>
              <input type="text" id="userName" placeholder="Ex: Thomas Dubois" required>
            </div>
            <div class="form-group">
              <label for="userEmail">Adresse Email</label>
              <input type="email" id="userEmail" placeholder="t.dubois@ecole.dz" required>
            </div>
            <div class="form-group">
              <label for="userPassword">Mot de passe</label>
              <input type="password" id="userPassword" placeholder="••••••••" required>
            </div>
            <div class="form-group">
              <label for="userRole">Rôle</label>
              <select id="userRole" required>
                <option value="student">Étudiant</option>
                <option value="teacher">Professeur</option>
                <option value="admin">Administrateur</option>
              </select>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn-secondary" id="cancelModalBtn">Annuler</button>
            <button type="submit" class="btn-primary">Enregistrer</button>
          </div>
        </form>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHTML);

  // ==========================================
  // 5. OUVERTURE / FERMETURE MODALE
  // ==========================================
  const openModalBtn = document.getElementById('btnAddUser');
  const modalOverlay = document.getElementById('userModal');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const cancelModalBtn = document.getElementById('cancelModalBtn');
  const addUserForm = document.getElementById('addUserForm');

  function openModal() {
    addUserForm.reset();
    modalOverlay.classList.add('active');
  }

  function closeModal() {
    modalOverlay.classList.remove('active');
  }

  if (openModalBtn) openModalBtn.addEventListener('click', openModal);
  if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
  if (cancelModalBtn) cancelModalBtn.addEventListener('click', closeModal);

  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });

  // ==========================================
  // 6. SOUMISSION DU FORMULAIRE D'AJOUT
  // ==========================================
  addUserForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const userData = {
      name: document.getElementById('userName').value.trim(),
      email: document.getElementById('userEmail').value.trim(),
      mot_passe: document.getElementById('userPassword').value,
      role: document.getElementById('userRole').value
    };

    const submitBtn = addUserForm.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.textContent;
    submitBtn.textContent = 'Enregistrement...';
    submitBtn.disabled = true;

    try {
      await API.admin.createUser(userData);
      closeModal();
      chargerUtilisateurs(); // recharge la liste complète depuis le serveur
    } catch (error) {
      console.error('Erreur API:', error);
      alert(`Échec : ${error.message}`);
    } finally {
      submitBtn.textContent = originalBtnText;
      submitBtn.disabled = false;
    }
  });

  // ==========================================
  // 7. CHARGEMENT INITIAL
  // ==========================================
  chargerUtilisateurs();

});