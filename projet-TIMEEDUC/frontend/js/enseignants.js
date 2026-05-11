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

// ==================== CHARGEMENT DES ENSEIGNANTS ====================
async function chargerEnseignants() {
    const tbody = document.getElementById('enseignantsBody');
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:30px;"><i class="fas fa-spinner fa-spin"></i> Chargement...</td></tr>`;

    try {
        const reponse = await fetch(`${API}/enseignants`, {
            headers: { 'Authorization': token }
        });
        const donnees = await reponse.json();

        if (donnees.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align:center;color:#888;padding:40px;">
                        <i class="fas fa-user-slash" style="font-size:2rem;margin-bottom:10px;display:block;"></i>
                        Aucun enseignant enregistré
                    </td>
                </tr>`;
            return;
        }

        tbody.innerHTML = donnees.map(ens => `
            <tr>
                <td><strong>${escapeHtml(ens.nom)}</strong></td>
                <td>${escapeHtml(ens.prenom)}</td>
                <td><span class="badge badge-grade">${escapeHtml(ens.grade)}</span></td>
                <td><span class="badge badge-statut">${escapeHtml(ens.statut)}</span></td>
                <td>${escapeHtml(ens.departement)}</td>
                <td>${ens.taux_horaire} FCFA</td>
                <td>${ens.heures_contractuelles} h</td>
                <td>
                    <button class="btn-action btn-view" onclick="voirEnseignant(${ens.id})" title="Voir">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-action btn-edit" onclick="modifierEnseignant(${ens.id})" title="Modifier">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-action btn-delete" onclick="supprimerEnseignant(${ens.id})" title="Supprimer">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');

    } catch (erreur) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;color:red;padding:30px;">Erreur de chargement</td></tr>`;
    }
}

// ==================== MODAL AJOUT ====================
function openModal() {
    document.getElementById('modal').classList.remove('hidden');
    document.getElementById('modalTitle').innerHTML = '<i class="fas fa-user-plus"></i> Ajouter un enseignant';
    document.getElementById('enseignantForm').reset();
    document.getElementById('enseignantId').value = '';
}

function closeModal() {
    document.getElementById('modal').classList.add('hidden');
}

// ==================== ENREGISTRER ====================
async function saveEnseignant(event) {
    event.preventDefault();
    const id = document.getElementById('enseignantId').value;
    const isEdit = !!id;

    const donnees = {
        nom: document.getElementById('nom').value.trim(),
        prenom: document.getElementById('prenom').value.trim(),
        email: document.getElementById('email').value.trim(),
        grade: document.getElementById('grade').value,
        statut: document.getElementById('statut').value,
        departement: document.getElementById('departement').value.trim(),
        taux_horaire: parseFloat(document.getElementById('taux_horaire').value),
        heures_contractuelles: parseInt(document.getElementById('heures_contractuelles').value)
    };

    try {
        const reponse = await fetch(`${API}/enseignants${isEdit ? '/' + id : ''}`, {
            method: isEdit ? 'PUT' : 'POST',
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
        closeModal();
        chargerEnseignants();

    } catch (erreur) {
        showToast('Erreur de connexion au serveur', 'error');
    }
}

// ==================== VOIR DÉTAILS ====================
async function voirEnseignant(id) {
    try {
        const reponse = await fetch(`${API}/enseignants`, {
            headers: { 'Authorization': token }
        });
        const donnees = await reponse.json();
        const ens = donnees.find(e => e.id == id);
        if (!ens) return;

        document.getElementById('detailsContent').innerHTML = `
            <div class="details-grid">
                <div class="detail-item"><label>Nom</label><span>${escapeHtml(ens.nom)}</span></div>
                <div class="detail-item"><label>Prénom</label><span>${escapeHtml(ens.prenom)}</span></div>
                <div class="detail-item"><label>Grade</label><span>${escapeHtml(ens.grade)}</span></div>
                <div class="detail-item"><label>Statut</label><span>${escapeHtml(ens.statut)}</span></div>
                <div class="detail-item"><label>Département</label><span>${escapeHtml(ens.departement)}</span></div>
                <div class="detail-item"><label>Taux horaire</label><span>${ens.taux_horaire} FCFA</span></div>
                <div class="detail-item"><label>Heures contractuelles</label><span>${ens.heures_contractuelles} h</span></div>
                <div class="detail-item full-width"><label>Email</label><span>${escapeHtml(ens.email)}</span></div>
            </div>
            <div class="details-actions">
                <button class="btn-primary" onclick="closeDetailsModal(); modifierEnseignant(${ens.id})">
                    <i class="fas fa-edit"></i> Modifier
                </button>
            </div>
        `;
        document.getElementById('detailsModal').classList.remove('hidden');
    } catch (erreur) {
        showToast('Erreur de chargement', 'error');
    }
}

function closeDetailsModal() {
    document.getElementById('detailsModal').classList.add('hidden');
}

// ==================== MODIFIER ====================
async function modifierEnseignant(id) {
    try {
        const reponse = await fetch(`${API}/enseignants`, {
            headers: { 'Authorization': token }
        });
        const donnees = await reponse.json();
        const ens = donnees.find(e => e.id == id);
        if (!ens) return;

        openModal();
        document.getElementById('modalTitle').innerHTML = '<i class="fas fa-edit"></i> Modifier un enseignant';
        document.getElementById('enseignantId').value = ens.id;
        document.getElementById('nom').value = ens.nom;
        document.getElementById('prenom').value = ens.prenom;
        document.getElementById('email').value = ens.email;
        document.getElementById('grade').value = ens.grade;
        document.getElementById('statut').value = ens.statut;
        document.getElementById('departement').value = ens.departement;
        document.getElementById('taux_horaire').value = ens.taux_horaire;
        document.getElementById('heures_contractuelles').value = ens.heures_contractuelles;

    } catch (erreur) {
        showToast('Erreur de chargement', 'error');
    }
}

// ==================== SUPPRIMER ====================
async function supprimerEnseignant(id) {
    if (!confirm('Voulez-vous vraiment supprimer cet enseignant ?')) return;

    try {
        const reponse = await fetch(`${API}/enseignants/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': token }
        });
        const resultat = await reponse.json();

        if (!reponse.ok) {
            showToast(resultat.message, 'error');
            return;
        }

        showToast(resultat.message, 'success');
        chargerEnseignants();

    } catch (erreur) {
        showToast('Erreur de connexion au serveur', 'error');
    }
}

// ==================== IMPORT EXCEL ====================
async function importerExcel(event) {
    const fichier = event.target.files[0];
    if (!fichier) return;

    const formData = new FormData();
    formData.append('fichier', fichier);

    showToast('Import en cours...', 'info');

    try {
        const reponse = await fetch(`${API}/import/enseignants`, {
            method: 'POST',
            headers: { 'Authorization': token },
            body: formData
        });

        const resultat = await reponse.json();

        if (!reponse.ok) {
            showToast(resultat.message, 'error');
            return;
        }

        showToast(resultat.message, 'success');
        chargerEnseignants();
        event.target.value = '';

    } catch (erreur) {
        showToast('Erreur de connexion au serveur', 'error');
    }
}

// ==================== TÉLÉCHARGER MODÈLE ====================
function telechargerModele() {
    const contenu = 'Nom,Prénom,Email,Grade,Statut,Département,Taux horaire,Heures contractuelles,Mot de passe\n';
    contenu + 'Dupont,Jean,jean.dupont@univ.fr,Professeur,Permanent,Informatique,5000,120,password123\n';

    const blob = new Blob([contenu], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const lien = document.createElement('a');
    lien.href = url;
    lien.download = 'modele-enseignants.csv';
    lien.click();
    URL.revokeObjectURL(url);
}

// ==================== FILTRE ====================
function filterEnseignants() {
    const recherche = document.getElementById('searchInput').value.toLowerCase();
    const lignes = document.querySelectorAll('#enseignantsBody tr');
    lignes.forEach(ligne => {
        ligne.style.display = ligne.textContent.toLowerCase().includes(recherche) ? '' : 'none';
    });
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

document.getElementById('modal')?.addEventListener('click', function(e) {
    if (e.target === this) closeModal();
});

document.getElementById('detailsModal')?.addEventListener('click', function(e) {
    if (e.target === this) closeDetailsModal();
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
    chargerEnseignants();
});