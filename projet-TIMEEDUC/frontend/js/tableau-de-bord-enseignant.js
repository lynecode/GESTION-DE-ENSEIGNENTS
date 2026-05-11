// ==================== AUTHENTIFICATION ====================
const token = localStorage.getItem('token');
const role = localStorage.getItem('role');

if (!token || role !== 'enseignant') {
    window.location.href = '../../../index.html';
}

const nomUser = localStorage.getItem('nom') || 'Enseignant';
const enseignantId = localStorage.getItem('enseignantId');
const userNameSpan = document.getElementById('userName');
if (userNameSpan) userNameSpan.textContent = nomUser;

const API = 'http://localhost:3000/api';

// ==================== DÉCONNEXION ====================
function deconnexion() {
    localStorage.clear();
    window.location.href = '../../../index.html';
}

// ==================== CHARGEMENT DU RÉCAPITULATIF ====================
async function chargerRecapitulatif() {
    try {
        const reponse = await fetch(`${API}/heures/recapitulatif/${enseignantId}`, {
            headers: { 'Authorization': token }
        });
        const donnees = await reponse.json();

        document.getElementById('statTotalHeures').textContent = donnees.total_heures || 0;
        document.getElementById('statHeuresCM').textContent = donnees.total_cm || 0;
        document.getElementById('statHeuresTD').textContent = donnees.total_td || 0;
        document.getElementById('statHeuresTP').textContent = donnees.total_tp || 0;

        document.getElementById('monProfil').innerHTML = `
            <div style="display:flex;flex-direction:column;gap:12px;">
                <div style="display:flex;justify-content:space-between;padding:10px;background:#f8f9fa;border-radius:8px;">
                    <span style="color:#888;">Nom complet</span>
                    <strong>${escapeHtml(donnees.nom)} ${escapeHtml(donnees.prenom)}</strong>
                </div>
                <div style="display:flex;justify-content:space-between;padding:10px;background:#f8f9fa;border-radius:8px;">
                    <span style="color:#888;">Grade</span>
                    <strong>${escapeHtml(donnees.grade)}</strong>
                </div>
                <div style="display:flex;justify-content:space-between;padding:10px;background:#f8f9fa;border-radius:8px;">
                    <span style="color:#888;">Statut</span>
                    <strong>${escapeHtml(donnees.statut)}</strong>
                </div>
                <div style="display:flex;justify-content:space-between;padding:10px;background:#f8f9fa;border-radius:8px;">
                    <span style="color:#888;">Département</span>
                    <strong>${escapeHtml(donnees.departement)}</strong>
                </div>
                <div style="display:flex;justify-content:space-between;padding:10px;background:#f8f9fa;border-radius:8px;">
                    <span style="color:#888;">Heures contractuelles</span>
                    <strong>${donnees.heures_contractuelles} h</strong>
                </div>
                <div style="display:flex;justify-content:space-between;padding:10px;background:#fff3cd;border-radius:8px;">
                    <span style="color:#888;">Heures complémentaires</span>
                    <strong style="color:#f0c027;">${donnees.heures_complementaires} h</strong>
                </div>
                <div style="display:flex;justify-content:space-between;padding:10px;background:#e8f5e9;border-radius:8px;">
                    <span style="color:#888;">Montant total</span>
                    <strong style="color:#2e7d32;">${donnees.montant_total.toLocaleString('fr-FR')} FCFA</strong>
                </div>
            </div>
        `;

    } catch (erreur) {
        console.error('Erreur chargement récapitulatif :', erreur);
    }
}

// ==================== DERNIÈRES HEURES ====================
async function chargerDernieresHeures() {
    const tbody = document.getElementById('dernieresHeures');

    try {
        const reponse = await fetch(`${API}/heures/enseignant/${enseignantId}`, {
            headers: { 'Authorization': token }
        });
        const donnees = await reponse.json();

        if (donnees.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="empty-row">
                        <i class="fas fa-inbox"></i><br>Aucune heure enregistrée
                    </td>
                </tr>`;
            return;
        }

        const dernieres = donnees.slice(0, 5);
        tbody.innerHTML = dernieres.map(h => `
            <tr>
                <td>${new Date(h.date_cours).toLocaleDateString('fr-FR')}</td>
                <td>${escapeHtml(h.matiere)}</td>
                <td><span class="badge-grade">${escapeHtml(h.type_heure)}</span></td>
                <td>${h.duree} h</td>
                <td>${escapeHtml(h.salle) || '-'}</td>
            </tr>
        `).join('');

    } catch (erreur) {
        tbody.innerHTML = `<tr><td colspan="5" class="empty-row">Erreur de chargement</td></tr>`;
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
function afficherBienvenue() {
    const nom = localStorage.getItem('nom') || 'Enseignant';
    const heure = new Date().getHours();
    let salutation = '';

    if (heure < 12) salutation = 'Bonjour';
    else if (heure < 18) salutation = 'Bon après-midi';
    else salutation = 'Bonsoir';

    const jour = new Date().toLocaleDateString('fr-FR', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    document.getElementById('messageBienvenue').textContent = `${salutation}, ${nom} ! 👋`;
    document.getElementById('sousTitreBienvenue').textContent = `Nous sommes le ${jour}. Voici un aperçu de vos heures effectuées.`;
}

document.addEventListener('DOMContentLoaded', () => {
    afficherBienvenue();
    chargerRecapitulatif();
    chargerDernieresHeures();
});;