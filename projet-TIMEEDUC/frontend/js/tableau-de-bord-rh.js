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

// ==================== CHARGEMENT DES STATISTIQUES ====================
async function chargerStatistiques() {
    try {
        const reponse = await fetch(`${API}/statistiques/tableau-de-bord`, {
            headers: { 'Authorization': token }
        });
        const donnees = await reponse.json();

        document.getElementById('statEnseignants').textContent = donnees.totalEnseignants || 0;
        document.getElementById('statHeures').textContent = donnees.totalHeures || 0;
        document.getElementById('statDepassements').textContent = donnees.totalDepassements || 0;

    } catch (erreur) {
        console.error('Erreur chargement statistiques :', erreur);
    }
}

// ==================== CHARGEMENT DU MONTANT TOTAL ====================
async function chargerMontantTotal() {
    try {
        const reponse = await fetch(`${API}/enseignants`, {
            headers: { 'Authorization': token }
        });
        const enseignants = await reponse.json();

        let montantTotal = 0;

        await Promise.all(enseignants.map(async (ens) => {
            const rep = await fetch(`${API}/heures/recapitulatif/${ens.id}`, {
                headers: { 'Authorization': token }
            });
            const data = await rep.json();
            if (data.montant_total) montantTotal += data.montant_total;
        }));

        document.getElementById('statMontant').textContent = montantTotal.toLocaleString('fr-FR');

    } catch (erreur) {
        console.error('Erreur chargement montant :', erreur);
    }
}

// ==================== DERNIÈRES HEURES SAISIES ====================
async function chargerDernieresHeures() {
    const tbody = document.getElementById('dernieresHeures');

    try {
        const reponse = await fetch(`${API}/heures`, {
            headers: { 'Authorization': token }
        });
        const donnees = await reponse.json();

        if (donnees.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" class="empty-row">
                        <i class="fas fa-inbox"></i><br>Aucune heure récente
                    </td>
                </tr>`;
            return;
        }

        const dernieres = donnees.slice(0, 5);
        tbody.innerHTML = dernieres.map(h => `
            <tr>
                <td>${escapeHtml(h.nom)} ${escapeHtml(h.prenom)}</td>
                <td>${escapeHtml(h.matiere)}</td>
                <td><span class="badge-grade">${escapeHtml(h.type_heure)}</span></td>
                <td>${h.duree} h</td>
            </tr>
        `).join('');

    } catch (erreur) {
        tbody.innerHTML = `<tr><td colspan="4" class="empty-row">Erreur de chargement</td></tr>`;
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
    chargerMontantTotal();
    chargerDernieresHeures();
});