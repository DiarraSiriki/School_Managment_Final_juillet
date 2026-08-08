document.getElementById('loginForm').addEventListener('submit', async (e) => {
     e.preventDefault();

     const email = document.getElementById('email').value;
     const mot_passe = document.getElementById('mot_passe').value;
     
     try{
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ email, mot_passe })
        });
        const result = await response.json();

        if (result.success) {

            localStorage.setItem('token', result.token);
            localStorage.setItem('user', JSON.stringify(result.user));

            if (result.user.role === 'admin') window.location.href = '/dashboard-admin.html';
            else if (result.user.role == 'teacher') window.location.href = '/dashboard-prof.html';
            else window.location.href = '/dashboard-student.html';
        } else {
            alert(result.message);
        }
     } catch (error) {
        console.error('Erreur de connexion:', error);
     }
});