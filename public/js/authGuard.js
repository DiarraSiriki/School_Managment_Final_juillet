const AuthGuard = {

  getUser() {
    const userJson = localStorage.getItem('user');
    return userJson ? JSON.parse(userJson) : null;
  },

  // Récupère le rôle réel stocké en base : 'admin', 'teacher', 'student'
  getRole() {
    const user = this.getUser();
    return user ? user.role : null;
  },

  // Matrice des permissions (clés alignées sur les vrais rôles de la BDD)
  permissions: {
    admin: [
      'gerer_utilisateurs',
      'gerer_etudiants',
      'gerer_professeurs',
      'gerer_matieres',
      'gerer_notes',
      'gerer_absences'
    ],
    teacher: [
      'consulter_etudiants',
      'consulter_matieres',
      'ajouter_notes',
      'modifier_notes',
      'consulter_absences'
    ],
    student: [
      'voir_ses_notes',
      'voir_ses_absences'
    ]
  },

  // Vérifie si le rôle actuel possède une permission spécifique
  can(permission) {
    const role = this.getRole();
    if (!role || !this.permissions[role]) return false;
    return this.permissions[role].includes(permission);
  },

 
  checkPageAccess() {
    const role = this.getRole();

    if (!role) {
      window.location.href = '/';
      return false;
    }

    const allowedRolesAttr = document.body.getAttribute('data-roles');
    if (allowedRolesAttr) {
      const allowedRoles = allowedRolesAttr.split(',').map(r => r.trim());
      if (!allowedRoles.includes(role)) {
        const redirects = {
          admin: '/dashboard-admin',
          teacher: '/dashboard-prof',
          student: '/dashboard-etudiant'
        };
        window.location.href = redirects[role] || '/';
        return false;
      }
    }
    return true;
  },

  applyUI() {
    document.querySelectorAll('[data-perm]').forEach(element => {
      const requiredPerm = element.getAttribute('data-perm');
      if (!this.can(requiredPerm)) {
        element.style.display = 'none';
      }
    });
  },

  // Libellés lisibles pour chaque rôle
  roleLabels: {
    admin: 'Administrateur',
    teacher: 'Professeur',
    student: 'Étudiant'
  },

 
  getInitials(name) {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    const initials = parts.slice(0, 2).map(p => p[0]?.toUpperCase() || '').join('');
    return initials || '?';
  },

 
  renderUserWidget() {
    const footer = document.querySelector('.sidebar-footer');
    if (!footer) return;

    const user = this.getUser();
    if (!user) return;

    const initials = this.getInitials(user.name);
    const roleLabel = this.roleLabels[user.role] || user.role;

    footer.innerHTML = `
      <a href="/profil" class="sidebar-footer-link" title="Voir mon profil">
        <div class="admin-avatar">${initials}</div>
        <div class="admin-info">
          <span class="admin-name">${user.name || 'Utilisateur'}</span>
          <span class="admin-email">${roleLabel}</span>
        </div>
      </a>
      <button type="button" class="logout-btn" id="logoutBtn" title="Se déconnecter">
        <i class="fa-solid fa-right-from-bracket"></i>
      </button>
    `;

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        if (confirm('Voulez-vous vraiment vous déconnecter ?')) {
          API.auth.logout();
        }
      });
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  if (AuthGuard.checkPageAccess()) {
    AuthGuard.applyUI();
    AuthGuard.renderUserWidget();
  }
});