document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const mot_passe = document.getElementById('password').value;

    try {
        // 1. Appel via le module centralisé API.js
        const result = await API.auth.login({ email, mot_passe });

        if (result.success || result.token) {
            const rawRole = result.user?.role ? String(result.user.role).trim().toLowerCase() : '';
            const normalizedRoleMap = {
                admin: 'Admin',
                administrateur: 'Admin',
                teacher: 'Prof',
                professeur: 'Prof',
                prof: 'Prof',
                student: 'Etudiant',
                etudiant: 'Etudiant',
                eleve: 'Etudiant'
            };
            const formattedRole = normalizedRoleMap[rawRole] || '';

            const userToStore = {
                ...result.user,
                role: formattedRole || result.user.role
            };

            localStorage.setItem('token', result.token);
            localStorage.setItem('user', JSON.stringify(userToStore));

            const redirectMap = {
                Admin: '/dashboard-admin',
                Prof: '/dashboard-prof',
                Etudiant: '/dashboard-etudiant'
            };

            const targetPath = redirectMap[formattedRole] || '/';
            if (formattedRole && redirectMap[formattedRole]) {
                window.location.href = targetPath;
            } else {
                alert("Rôle utilisateur inconnu.");
            }
        } else {
            alert(result.message || result.error || "Échec de la connexion.");
        }
    } catch (error) {
        console.error('Erreur de connexion:', error);
        alert(error.message || "Erreur réseau lors de la connexion.");
    }
});