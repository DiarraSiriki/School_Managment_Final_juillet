const AuthGuard = {
  // 1. Récupère l'objet utilisateur entier depuis le localStorage
  getUser() {
    const userJson = localStorage.getItem('user');
    return userJson ? JSON.parse(userJson) : null;
  },

  // 2. Récupère uniquement le rôle ('Admin', 'Prof', 'Etudiant')
  getRole() {
    const user = this.getUser();
    return user ? user.role : null;
  }, 

  // 3. Matrice des permissions
  permissions: {
    Admin: [
      'gerer_utilisateurs',
      'gerer_etudiants',
      'gerer_professeurs',
      'gerer_matieres',
      'gerer_notes',
      'gerer_absences'
    ],
    Prof: [
      'consulter_etudiants',
      'consulter_matieres',
      'ajouter_notes',
      'modifier_notes',
      'consulter_absences'
    ],
    Etudiant: [
      'voir_ses_notes',
      'voir_ses_absences'
    ]
  },

  // 4. Vérifie si le rôle actuel possède une permission spécifique
  can(permission) {
    const role = this.getRole();
    if (!role || !this.permissions[role]) return false;
    return this.permissions[role].includes(permission);
  }, // <-- Virgule obligatoire ici

  // 5. Masquage dynamique dans le DOM
  applyUI() {
    const role = this.getRole();

    // Redirection si personne n'est connecté
    if (!role) {
      window.location.href = '/login.html';
      return;
    }

    // Parcourt tous les éléments HTML avec l'attribut data-perm
    document.querySelectorAll('[data-perm]').forEach(element => {
      const requiredPerm = element.getAttribute('data-perm');
      
      // Si l'utilisateur n'a pas la permission, on cache le bouton/lien
      if (!this.can(requiredPerm)) {
        element.style.display = 'none';
      }
    });
  }
}; 


// Déclenche l'adaptation de l'interface dès que le HTML est chargé

document.addEventListener('DOMContentLoaded', () => {
  AuthGuard.applyUI();
});