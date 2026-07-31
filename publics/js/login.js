const loginForm = document.getElementById('loginForm');
const errorBox = document.getElementById('error-box');

// Redirection selon le rôle stocké en base (admin / teacher / student)
const REDIRECT_BY_ROLE = {
    admin: '/dashboard-admin',
    teacher: '/dashboard-prof',
    student: '/dashboard-etudiant'
};

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    errorBox.style.display = 'none';
    errorBox.textContent = '';

    const email = document.getElementById('email').value.trim();
    const mot_passe = document.getElementById('password').value;

    const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, mot_passe })
    });

    if (!data.success) {
        errorBox.textContent = data.message || 'Erreur de connexion';
        errorBox.style.display = 'block';
        return;
    }

    // Stockage du token et des infos utilisateur pour api.js et les dashboards
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));

    const redirectUrl = REDIRECT_BY_ROLE[data.user.role] || '/';
    window.location.href = redirectUrl;
});
