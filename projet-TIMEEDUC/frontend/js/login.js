document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const mot_de_passe = document.getElementById('mot_de_passe').value;
    const erreur = document.getElementById('erreur');

    try {
        const response = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, mot_de_passe })
        });

        const data = await response.json();

        if (!response.ok) {
            erreur.textContent = data.message;
            return;
        }

        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.role);
        localStorage.setItem('nom', data.nom);

        if (data.enseignantId) {
            localStorage.setItem('enseignantId', data.enseignantId);
        }

        if (data.role === 'admin') {
            window.location.href = 'frontend/pages/admin/dashboard.html';
        } else if (data.role === 'rh') {
            window.location.href = 'frontend/pages/rh/dashboard.html';
        } else {
            window.location.href = 'frontend/pages/enseignant/dashboard.html';
        }

    } catch (err) {
        erreur.textContent = 'Erreur de connexion au serveur';
    }
});