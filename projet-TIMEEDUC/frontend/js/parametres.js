// ==================== AUTHENTIFICATION ====================
const token = localStorage.getItem('token');
const role = localStorage.getItem('role');

if (!token || role !== 'admin') {
    window.location.href = '../../../index.html';
}

const nomUser = localStorage.getItem('nom') || 'Administrateur';
const userNameSpan = document.getElementById('userName');
if (userNameSpan) userNameSpan.textContent = nomUser;

const API = 'http://localhost:3000/api';

// ==================== DÉCONNEXION ====================
function deconnexion() {
    localStorage.clear();
    window.location.href = '../../../index.html';
}

// ==================== CHARGEMENT DES PARAMÈTRES ====================
async function chargerParametres() {
    try {
        const reponse = await fetch(`${API}/parametres`, {
            headers: { 'Authorization': token }
        });
        const donnees = await reponse.json();

        document.getElementById('annee_academique').value = donnees.annee_academique || '';
        document.getElementById('equivalence_cm').value = donnees.equivalence_cm || 1.5;
        document.getElementById('equivalence_tp').value = donnees.equivalence_tp || 0.75;

        document.getElementById('anneeAffichee').textContent = donnees.annee_academique || '-';
        document.getElementById('equivalenceCMAffichee').textContent = donnees.equivalence_cm ? `1h CM = ${donnees.equivalence_cm}h TD` : '-';
        document.getElementById('equivalenceTPAffichee').textContent = donnees.equivalence_tp ? `1h TP = ${donnees.equivalence_tp}h TD` : '-';

    } catch (erreur) {
        console.error('Erreur chargement paramètres :', erreur);
    }
}

// ==================== SAUVEGARDER LES PARAMÈTRES ====================
async function sauvegarderParametres(event) {
    event.preventDefault();

    const donnees = {
        annee_academique: document.getElementById('annee_academique').value.trim(),
        equivalence_cm: parseFloat(document.getElementById('equivalence_cm').value),
        equivalence_tp: parseFloat(document.getElementById('equivalence_tp').value)
    };

    try {
        const reponse = await fetch(`${API}/parametres`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token
            },
            body: JSON.stringify(donnees)
        });

        const resultat = await reponse.json();

        if (!reponse.ok) {
            showToast(resultat.message, 'error');
            return;
        }

        showToast(resultat.message, 'success');
        chargerParametres();

    } catch (erreur) {
        showToast('Erreur de connexion au serveur', 'error');
    }
}

// ==================== TOAST ====================
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i> ${message}`;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ==================== MENU ====================
function toggleMenu() {
    const navBar = document.getElementById('navBar');
    navBar.classList.toggle('active');
}

document.addEventListener('click', function(e) {
    const navBar = document.getElementById('navBar');
    if (navBar && !navBar.contains(e.target)) {
        navBar.classList.remove('active');
    }
});

// ==================== INITIALISATION ====================
document.addEventListener('DOMContentLoaded', () => {
    chargerParametres();
});