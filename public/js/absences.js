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
