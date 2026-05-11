// ==================== AUTHENTIFICATION ====================
const token = localStorage.getItem('token');
const role = localStorage.getItem('role');

if (!token || role !== 'admin') {
    window.location.href = '../../../index.html';
}

const API = 'http://localhost:3000/api';

// Affichage du nom de l'utilisateur
const nom = localStorage.getItem('nom') || 'Administrateur';
const nomElement = document.getElementById('userName');
if (nomElement) nomElement.textContent = nom;

// ==================== DÉCONNEXION ====================
function deconnexion() {
    localStorage.clear();
    window.location.href = '../../../index.html';
}

// ==================== CHARGEMENT DES STATISTIQUES ====================
async function chargerStatistiques() {
    document.getElementById('statEnseignants').innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    document.getElementById('statMatieres').innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    document.getElementById('statHeures').innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    document.getElementById('statDepassements').innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

    try {
        const response = await fetch(`${API}/statistiques/tableau-de-bord`, {
            headers: { 'Authorization': token }
        });
        const data = await response.json();

        if (response.ok) {
            document.getElementById('statEnseignants').textContent = data.totalEnseignants || 0;
            document.getElementById('statMatieres').textContent = data.totalMatieres || 0;
            document.getElementById('statHeures').textContent = data.totalHeures || 0;
            document.getElementById('statDepassements').textContent = data.totalDepassements || 0;
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('Erreur chargement statistiques :', error);
        document.getElementById('statEnseignants').textContent = '0';
        document.getElementById('statMatieres').textContent = '0';
        document.getElementById('statHeures').textContent = '0';
        document.getElementById('statDepassements').textContent = '0';
    }
}

// ==================== CHARGEMENT DES ENSEIGNANTS RÉCENTS ====================
async function chargerEnseignantsRecents() {
    const tbody = document.getElementById('recentEnseignantsBody');
    tbody.innerHTML = `<tr><td colspan="6" class="empty-row"><i class="fas fa-spinner fa-spin"></i> Chargement...</td></tr>`;

    try {
        const response = await fetch(`${API}/enseignants/recents`, {
            headers: { 'Authorization': token }
        });
        const data = await response.json();

        if (!response.ok) throw new Error(data.message);

        if (data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" class="empty-row"><i class="fas fa-user-slash"></i><br>Aucun enseignant</td></tr>`;
            return;
        }

        tbody.innerHTML = data.map(ens => `
            <tr>
                <td><strong>${escapeHtml(ens.nom)}</strong></td>
                <td>${escapeHtml(ens.prenom)}</td>
                <td><span class="badge-grade">${escapeHtml(ens.grade)}</span></td>
                <td><span class="badge-statut">${escapeHtml(ens.statut)}</span></td>
                <td>${escapeHtml(ens.departement)}</td>
                <td><strong>${ens.taux_horaire} FCFA</strong></td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Erreur chargement enseignants :', error);
        tbody.innerHTML = `<tr><td colspan="6" class="empty-row">Erreur de chargement</td></tr>`;
    }
}

// ==================== ANNÉE ACADÉMIQUE ====================
async function chargerAnneeAcademique() {
    try {
        const reponse = await fetch(`${API}/statistiques/annee-academique`, {
            headers: { 'Authorization': token }
        });
        const donnees = await reponse.json();
        const el = document.getElementById('anneeAcademique');
        if (el) el.textContent = donnees.annee_academique || 'Non définie';
    } catch (erreur) {
        console.error('Erreur chargement année :', erreur);
    }
}

// ==================== HISTORIQUE DES ACTIONS ====================
async function chargerHistorique() {
    const tbody = document.getElementById('historyTableBody');

    try {
        const reponse = await fetch(`${API}/enseignants/recents`, {
            headers: { 'Authorization': token }
        });
        const donnees = await reponse.json();

        if (donnees.length === 0) {
            tbody.innerHTML = `<tr><td colspan="3" class="empty-row"><i class="fas fa-inbox"></i><br>Aucune action récente</td></tr>`;
            return;
        }

        tbody.innerHTML = donnees.map(ens => `
            <tr>
                <td>${new Date().toLocaleDateString('fr-FR')}</td>
                <td><span style="color:#27ae60;font-weight:600;">Ajout</span></td>
                <td>Enseignant ${escapeHtml(ens.nom)} ${escapeHtml(ens.prenom)} ajouté</td>
            </tr>
        `).join('');

    } catch (erreur) {
        tbody.innerHTML = `<tr><td colspan="3" class="empty-row">Erreur de chargement</td></tr>`;
    }
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

// ==================== UTILITAIRE ====================
function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// ==================== INITIALISATION ====================
document.addEventListener('DOMContentLoaded', () => {
    chargerStatistiques();
    chargerEnseignantsRecents();
    chargerAnneeAcademique();
    chargerHistorique();
});