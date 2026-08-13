document.addEventListener('DOMContentLoaded', () => {

  // ==========================================
  // 1. GESTION DES RECHERCHES ET FILTRES (TABLEAU)
  // ==========================================
  const searchInput = document.querySelector('.search-box input');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const tableBody = document.querySelector('tbody');

  let currentSearch = '';
  let currentFilter = 'Tous';

  function filterTable() {
    const tableRows = tableBody.querySelectorAll('tr');

    tableRows.forEach(row => {
      const userNameEl = row.querySelector('.user-name');
      const emailEl = row.children[1];
      const roleBadgeEl = row.querySelector('.role-badge');

      if (!userNameEl || !emailEl || !roleBadgeEl) return;

      const name = userNameEl.textContent.toLowerCase();
      const email = emailEl.textContent.toLowerCase();
      const role = roleBadgeEl.textContent.trim().toLowerCase();

      const matchesSearch = name.includes(currentSearch) || email.includes(currentSearch);
      const matchesFilter = (currentFilter === 'Tous') || (role === currentFilter.toLowerCase());

      row.style.display = (matchesSearch && matchesFilter) ? '' : 'none';
    });
  }

  // Événement Recherche
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentSearch = e.target.value.toLowerCase().trim();
      filterTable();
    });
  }

  // Événement Filtres Rôles
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.textContent.trim();
      filterTable();
    });
  });


  // ==========================================
  // 2. INJECTION HTML DE LA MODALE D'AJOUT
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
              <label for="userRole">Rôle</label>
              <select id="userRole" required>
                <option value="Étudiant">Étudiant</option>
                <option value="Professeur">Professeur</option>
                <option value="Administrateur">Administrateur</option>
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
  // 3. LOGIQUE OUVERTURE / FERMETURE MODALE
  // ==========================================
  const openModalBtn = document.querySelector('.content-header .btn-primary');
  const modalOverlay = document.getElementById('userModal');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const cancelModalBtn = document.getElementById('cancelModalBtn');

  function openModal() {
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
  // 4. SOUMISSION ET DYNAMISME DU TABLEAU
  // ==========================================
  const addUserForm = document.getElementById('addUserForm');

  // Génération d'initiales et de couleur pour l'avatar
  function getAvatarData(fullName) {
    const parts = fullName.trim().split(' ');
    const initials = parts.length > 1 
      ? `${parts[0][0]}${parts[1][0]}`.toUpperCase() 
      : `${parts[0][0]}${parts[0][1] || ''}`.toUpperCase();
    
    const colors = ['purple', 'blue', 'green', 'orange'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    return { initials, colorClass: randomColor };
  }

  // Ajout dynamique d'une ligne dans le DOM
  function addUserToTable(user) {
    const { initials, colorClass } = getAvatarData(user.name);

    let roleClass = 'role-etud';
    if (user.role === 'Administrateur') roleClass = 'role-admin';
    if (user.role === 'Professeur') roleClass = 'role-prof';

    const now = new Date();
    const dateFormatted = now.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const timeFormatted = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <div class="user-cell">
          <div class="avatar ${colorClass}">${initials}</div>
          <div>
            <div class="user-name">${user.name}</div>
            <div class="user-id">${user.id || 'USR-NEW'}</div>
          </div>
        </div>
      </td>
      <td>${user.email}</td>
      <td><span class="role-badge ${roleClass}">${user.role}</span></td>
      <td>
        <div class="date">${dateFormatted}</div>
        <div class="time">${timeFormatted}</div>
      </td>
      <td>
        <div class="status">
          <span class="status-dot"></span> Actif
        </div>
      </td>
    `;

    tableBody.prepend(tr); // Ajoute la ligne au début du tableau
    filterTable(); // Re-filtre si une recherche était active
  }

  // Événement Soumission Formulaire (API Express.js)
  addUserForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const userData = {
      name: document.getElementById('userName').value.trim(),
      email: document.getElementById('userEmail').value.trim(),
      role: document.getElementById('userRole').value
    };

    const submitBtn = addUserForm.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.textContent;
    submitBtn.textContent = 'Enregistrement...';
    submitBtn.disabled = true;

    try {
      // Modifiez l'URL selon votre route backend Express.js
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify(userData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Erreur lors de la création de l\'utilisateur.');
      }

      // Ajout direct dans le DOM + Reset Formulaire
      addUserToTable(result.user || userData);
      addUserForm.reset();
      closeModal();

    } catch (error) {
      console.error('Erreur API:', error);
      alert(`Échec : ${error.message}`);
    } finally {
      submitBtn.textContent = originalBtnText;
      submitBtn.disabled = false;
    }
  });

});