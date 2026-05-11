// ==================== AUTHENTIFICATION ====================
const token = localStorage.getItem('token');
const role = localStorage.getItem('role');

if (!token || role !== 'rh') {
    window.location.href = '../../../index.html';
}

const nomUser = localStorage.getItem('nom') || 'RH';
const userNameSpan = document.getElementById('userName');
if (userNameSpan) userNameSpan.textContent = nomUser;

const API = 'http://localhost:3000/api';

// ==================== DÉCONNEXION ====================
function deconnexion() {
    localStorage.clear();
    window.location.href = '../../../index.html';
}

// ==================== EXPORT EXCEL ====================
async function exporterExcel() {
    try {
        const reponse = await fetch(`${API}/exports/excel`, {
            headers: { 'Authorization': token }
        });

        if (!reponse.ok) {
            showToast('Erreur lors de l\'export Excel', 'error');
            return;
        }

        const blob = await reponse.blob();
        const url = window.URL.createObjectURL(blob);
        const lien = document.createElement('a');
        lien.href = url;
        lien.download = 'heures-enseignants.xlsx';
        lien.click();
        window.URL.revokeObjectURL(url);
        showToast('Export Excel téléchargé avec succès', 'success');

    } catch (erreur) {
        showToast('Erreur de connexion au serveur', 'error');
    }
}

// ==================== EXPORT PDF ====================
async function exporterPDF() {
    try {
        const reponse = await fetch(`${API}/exports/pdf`, {
            headers: { 'Authorization': token }
        });

        if (!reponse.ok) {
            showToast('Erreur lors de l\'export PDF', 'error');
            return;
        }

        const blob = await reponse.blob();
        const url = window.URL.createObjectURL(blob);
        const lien = document.createElement('a');
        lien.href = url;
        lien.download = 'heures-enseignants.pdf';
        lien.click();
        window.URL.revokeObjectURL(url);
        showToast('Export PDF téléchargé avec succès', 'success');

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
    // Page prête
});