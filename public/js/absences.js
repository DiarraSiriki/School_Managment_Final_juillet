<<<<<<< Updated upstream
// Gestion de la page Absences

const ROLE_LABELS = {
  admin: 'Administrateur',
  teacher: 'Professeur',
  student: 'Étudiant'
};

let allAbsences = [];
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

function showAlert(message, type = 'success') {
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${type}`;
  alertDiv.textContent = message;
  alertDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 20px;
    border-radius: 8px;
    background: ${type === 'success' ? '#dcfce7' : '#fef2f2'};
    color: ${type === 'success' ? '#15803d' : '#ef4444'};
    z-index: 1000;
    font-weight: 600;
  `;
  document.body.appendChild(alertDiv);
  setTimeout(() => alertDiv.remove(), 3500);
}

// Chargement des absences
async function loadAbsences() {
  try {
    const absences = await API.absences.getAll();
    allAbsences = Array.isArray(absences) ? absences : [];
    renderStats();
    renderTable();
  } catch (error) {
    console.error('Erreur lors du chargement des absences:', error);
    const tbody = document.querySelector('.table-container tbody');
    if (tbody) {
      tbody.innerHTML = `<tr><td colspan="5">Erreur de chargement: ${escapeHtml(error.message)}</td></tr>`;
    }
  }
}

function renderStats() {
  const total = allAbsences.length;
  const justified = allAbsences.filter(a => a.status === 'justifiée').length;
  const notJustified = allAbsences.filter(a => a.status === 'non justifiée').length;

  const neutralCard = document.querySelector('.card-icon.neutral + .card-content .card-value');
  const warningCard = document.querySelector('.card-icon.warning + .card-content .card-value');
  const successCard = document.querySelector('.card-icon.success + .card-content .card-value');
  const subtitle = document.querySelector('.subtitle');

  if (neutralCard) neutralCard.textContent = total;
  if (warningCard) warningCard.textContent = notJustified;
  if (successCard) successCard.textContent = justified;
  if (subtitle) subtitle.textContent = `${total} absences enregistrées · ${notJustified} non justifiées`;
}

function renderTable() {
  const tbody = document.querySelector('.table-container tbody');
  if (!tbody) return;

  const filteredAbsences = allAbsences.filter(a => {
    if (!searchTerm) return true;
    const haystack = `${a.student_name || ''} ${a.classe || ''} ${a.matiere || ''}`.toLowerCase();
    return haystack.includes(searchTerm);
  });

  if (filteredAbsences.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5">Aucune absence trouvée.</td></tr>`;
    return;
  }

  tbody.innerHTML = filteredAbsences.map(a => {
    const statusClass = a.status === 'justifiée' ? 'badge-success' : 'badge-warning';
    return `
      <tr>
        <td><strong>${escapeHtml(a.student_name || 'Inconnu')}</strong></td>
        <td>${escapeHtml(a.classe || '-')}</td>
        <td>${escapeHtml(a.matiere || '-')}</td>
        <td>${escapeHtml(a.date || '-')}</td>
        <td>
          <div class="action-buttons">
            <button class="btn-edit" data-id="${a.id}" data-status="${a.status}">
              <i class="fa-solid fa-pen"></i>
            </button>
            <button class="btn-delete" data-id="${a.id}">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function renderTodayDate() {
  const dateEl = document.querySelector('.top-date');
  if (!dateEl) return;
  const formatted = new Date().toLocaleDateString('fr-FR', {
    weekday: 'short', day: 'numeric', month: 'long', year: 'numeric'
  });
  dateEl.innerHTML = `${formatted.charAt(0).toUpperCase() + formatted.slice(1)} <span class="status-dot"></span>`;
}

// Gestion des actions sur le tableau
function setupTableActions() {
  const tbody = document.querySelector('.table-container tbody');
  if (!tbody) return;

  tbody.addEventListener('click', async (e) => {
    const editBtn = e.target.closest('.btn-edit');
    const deleteBtn = e.target.closest('.btn-delete');

    if (editBtn) {
      const id = editBtn.dataset.id;
      const currentStatus = editBtn.dataset.status;
      const newStatus = currentStatus === 'justifiée' ? 'non justifiée' : 'justifiée';
      
      try {
        await API.absences.update(id, { status: newStatus });
        showAlert(`Absence ${newStatus === 'justifiée' ? 'justifiée' : 'désjustifiée'} avec succès`);
        await loadAbsences();
      } catch (error) {
        showAlert(`Erreur: ${error.message}`, 'error');
      }
    }

    if (deleteBtn) {
      const id = deleteBtn.dataset.id;
      if (!confirm('Supprimer cette absence ?')) return;
      
      try {
        await API.absences.delete(id);
        showAlert('Absence supprimée avec succès');
        await loadAbsences();
      } catch (error) {
        showAlert(`Erreur: ${error.message}`, 'error');
      }
    }
  });
}

// Gestion de la déconnexion
function setupLogout() {
  const logoutIcon = document.querySelector('.logout-icon');
  if (logoutIcon) {
    logoutIcon.addEventListener('click', async () => {
      await API.auth.logout();
    });
  }
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
  renderTodayDate();
  updateCurrentUserDisplay();
  setupTableActions();
  setupLogout();
  loadAbsences();
});
=======
const ROLE_LABELS = {
  admin: 'Administrateur',
  teacher: 'Professeur',
  student: 'Étudiant'
};

let allAbsences = [];
let allStudents = [];
let allClasses = [];
let allSubjects = [];
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

function showAlert(message, type = 'success') {
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${type}`;
  alertDiv.textContent = message;
  alertDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 20px;
    border-radius: 8px;
    background: ${type === 'success' ? '#dcfce7' : '#fef2f2'};
    color: ${type === 'success' ? '#15803d' : '#ef4444'};
    z-index: 1000;
    font-weight: 600;
  `;
  document.body.appendChild(alertDiv);
  setTimeout(() => alertDiv.remove(), 3500);
}

// Chargement complet des données API
async function loadAbsences() {
  try {
    const [absences, students, classes, subjects] = await Promise.all([
      API.absences.getAll(),
      API.students ? API.students.getAll() : Promise.resolve([]),
      API.classes ? API.classes.getAll() : Promise.resolve([]),
      API.subjects ? API.subjects.getAll() : Promise.resolve([])
    ]);

    allAbsences = Array.isArray(absences) ? absences : (absences?.data || []);
    allStudents = Array.isArray(students) ? students : (students?.data || []);
    allClasses = Array.isArray(classes) ? classes : (classes?.data || []);
    allSubjects = Array.isArray(subjects) ? subjects : (subjects?.data || []);

    populateSelects();
    renderStats();
    renderTable();
  } catch (error) {
    console.error('Erreur lors du chargement des données:', error);
    const tbody = document.querySelector('.table-container tbody');
    if (tbody) {
      tbody.innerHTML = `<tr><td colspan="5">Erreur de chargement: ${escapeHtml(error.message)}</td></tr>`;
    }
  }
}

// Remplissage des menus déroulants dans la modale
function populateSelects() {
  const studentSelect = document.getElementById('absenceStudent');
  const classSelect = document.getElementById('absenceClass');
  const subjectSelect = document.getElementById('absenceSubject');

  if (studentSelect) {
    studentSelect.innerHTML = '<option value="">Sélectionner un étudiant</option>' +
      allStudents.map(s => {
        const name = `${s.nom || s.name || ''} ${s.prenom || ''}`.trim() || `Élève #${s.id}`;
        return `<option value="${s.id}">${escapeHtml(name)}</option>`;
      }).join('');
  }

  if (classSelect) {
    classSelect.innerHTML = '<option value="">Sélectionner une classe</option>' +
      allClasses.map(c => `<option value="${c.id}">${escapeHtml(c.nom || c.name || 'Classe sans nom')}</option>`).join('');
  }

  if (subjectSelect) {
    subjectSelect.innerHTML = '<option value="">Sélectionner une matière</option>' +
      allSubjects.map(s => `<option value="${s.id}">${escapeHtml(s.nom || s.name || 'Matière sans nom')}</option>`).join('');
  }
}

function renderStats() {
  const total = allAbsences.length;
  const justified = allAbsences.filter(a => a.status === 'justifiée').length;
  const notJustified = allAbsences.filter(a => a.status === 'non justifiée').length;

  const neutralCard = document.querySelector('.card-icon.neutral + .card-content .card-value');
  const warningCard = document.querySelector('.card-icon.warning + .card-content .card-value');
  const successCard = document.querySelector('.card-icon.success + .card-content .card-value');
  const subtitle = document.querySelector('.subtitle');

  if (neutralCard) neutralCard.textContent = total;
  if (warningCard) warningCard.textContent = notJustified;
  if (successCard) successCard.textContent = justified;
  if (subtitle) subtitle.textContent = `${total} absences enregistrées · ${notJustified} non justifiées`;
}

function renderTable() {
  const tbody = document.querySelector('.table-container tbody');
  if (!tbody) return;

  if (allAbsences.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center;">Aucune absence trouvée.</td></tr>`;
    return;
  }

  tbody.innerHTML = allAbsences.map(a => {
    const isJustified = a.status === 'justifiée';
    const badgeClass = isJustified ? 'badge-success' : 'badge-warning';
    
    // Récupérer le nom de la classe via les données chargées
    const classeName = a.classe || '-';
    
    return `
      <tr>
        <td><strong>${escapeHtml(a.student_name || 'Inconnu')}</strong></td>
        <td>${escapeHtml(classeName)}</td>
        <td>-</td>
        <td>${escapeHtml(a.date || '-')}</td>
        <td><span class="badge ${badgeClass}">${escapeHtml(a.status || 'non justifiée')}</span></td>
        <td>
          <div class="action-buttons">
            <button class="btn-edit" data-id="${a.id}">
              <i class="fa-solid fa-pen"></i>
            </button>
            <button class="btn-delete" data-id="${a.id}">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function renderTodayDate() {
  const dateEl = document.querySelector('.top-date');
  if (!dateEl) return;
  const formatted = new Date().toLocaleDateString('fr-FR', {
    weekday: 'short', day: 'numeric', month: 'long', year: 'numeric'
  });
  dateEl.innerHTML = `${formatted.charAt(0).toUpperCase() + formatted.slice(1)} <span class="status-dot"></span>`;
}

// --- GESTION DE LA MODALE ---
function openModal(absence = null) {
  const modal = document.getElementById('absenceModal');
  const form = document.getElementById('absenceForm');
  const modalTitle = document.getElementById('modalTitle');
  
  if (!modal || !form) return;
  form.reset();

  if (absence) {
    if (modalTitle) modalTitle.textContent = "Modifier l'absence";
    document.getElementById('absenceId').value = absence.id;
    document.getElementById('absenceStudent').value = absence.student_id || '';
    document.getElementById('absenceClass').value = absence.classe_id || '';
    document.getElementById('absenceSubject').value = absence.subject_id || '';
    document.getElementById('absenceDate').value = absence.date || '';
    document.getElementById('absenceStatus').value = absence.status || 'non justifiée';
  } else {
    if (modalTitle) modalTitle.textContent = "Signaler une absence";
    document.getElementById('absenceId').value = '';
    document.getElementById('absenceDate').value = new Date().toISOString().split('T')[0];
  }

  modal.classList.add('show');
}

function closeModal() {
  const modal = document.getElementById('absenceModal');
  if (modal) modal.classList.remove('show');
}

// Événements du DOM
function setupEventListeners() {
  const tbody = document.querySelector('.table-container tbody');
  const btnPrimary = document.querySelector('.btn-primary');
  const modal = document.getElementById('absenceModal');
  const btnCancel = document.getElementById('btnCancelModal');
  const form = document.getElementById('absenceForm');

  if (btnPrimary) btnPrimary.addEventListener('click', () => openModal());
  if (btnCancel) btnCancel.addEventListener('click', closeModal);

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }

  if (tbody) {
    tbody.addEventListener('click', async (e) => {
      const editBtn = e.target.closest('.btn-edit');
      const deleteBtn = e.target.closest('.btn-delete');

      if (editBtn) {
        const id = editBtn.dataset.id;
        const absence = allAbsences.find(a => String(a.id) === String(id));
        if (absence) openModal(absence);
      }

      if (deleteBtn) {
        const id = deleteBtn.dataset.id;
        if (!confirm('Supprimer cette absence ?')) return;
        
        try {
          await API.absences.delete(id);
          showAlert('Absence supprimée avec succès');
          await loadAbsences();
        } catch (error) {
          showAlert(`Erreur: ${error.message}`, 'error');
        }
      }
    });
  }

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.getElementById('absenceId').value;
      
      const payload = {
        student_id: document.getElementById('absenceStudent').value,
        class_id: document.getElementById('absenceClass').value,
        subject_id: document.getElementById('absenceSubject').value,
        date: document.getElementById('absenceDate').value,
        status: document.getElementById('absenceStatus').value
      };

      try {
        if (id) {
          await API.absences.update(id, payload);
          showAlert('Absence mise à jour avec succès');
        } else {
          await API.absences.create(payload);
          showAlert('Absence enregistrée avec succès');
        }
        closeModal();
        await loadAbsences();
      } catch (error) {
        showAlert(`Erreur: ${error.message}`, 'error');
      }
    });
  }
}

function setupLogout() {
  const logoutIcon = document.querySelector('.logout-icon');
  if (logoutIcon) {
    logoutIcon.addEventListener('click', async () => {
      await API.auth.logout();
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  renderTodayDate();
  updateCurrentUserDisplay();
  setupEventListeners();
  setupLogout();
  loadAbsences();
});
>>>>>>> Stashed changes
