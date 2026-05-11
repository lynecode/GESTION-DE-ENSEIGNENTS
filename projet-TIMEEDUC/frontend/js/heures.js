// ==================== AUTHENTIFICATION ====================
const token = localStorage.getItem('token');
const role = localStorage.getItem('role');

if (!token || (role !== 'rh' && role !== 'admin')) {
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

// ==================== CHARGEMENT DES HEURES ====================
async function chargerHeures() {
    const tbody = document.getElementById('heuresBody');
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:30px;"><i class="fas fa-spinner fa-spin"></i> Chargement...</td></tr>`;

    try {
        const reponse = await fetch(`${API}/heures`, {
            headers: { 'Authorization': token }
        });
        const donnees = await reponse.json();

        if (donnees.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align:center;color:#888;padding:40px;">
                        <i class="fas fa-clock" style="font-size:2rem;margin-bottom:10px;display:block;"></i>
                        Aucune heure enregistrée
                    </td>
                </tr>`;
            return;
        }

        // Calculer les heures normales et complémentaires par enseignant
        const heuresParEnseignant = {};
        donnees.forEach(h => {
            if (!heuresParEnseignant[h.enseignant_id]) {
                heuresParEnseignant[h.enseignant_id] = 0;
            }
            heuresParEnseignant[h.enseignant_id] += parseFloat(h.duree);
        });

        tbody.innerHTML = donnees.map(h => {
            const totalEns = heuresParEnseignant[h.enseignant_id];
            const heuresContractuelles = h.heures_contractuelles || 0;
            const typeHeureLabel = totalEns > heuresContractuelles
                ? `<span style="color:#e74c3c;font-weight:600;">Complémentaire</span>`
                : `<span style="color:#27ae60;font-weight:600;">Normale</span>`;

            return `
            <tr>
                <td><strong>${escapeHtml(h.nom)} ${escapeHtml(h.prenom)}</strong></td>
                <td>${escapeHtml(h.matiere)}</td>
                <td>${new Date(h.date_cours).toLocaleDateString('fr-FR')}</td>
                <td><span class="badge badge-grade">${escapeHtml(h.type_heure)}</span></td>
                <td>${h.duree} h</td>
                <td>${typeHeureLabel}</td>
                <td>${escapeHtml(h.salle) || '-'}</td>
                <td>
                    <button class="btn-action btn-edit" onclick="modifierHeure(${h.id})" title="Modifier">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-action btn-delete" onclick="supprimerHeure(${h.id})" title="Supprimer">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>`;
        }).join('');

    } catch (erreur) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;color:red;padding:30px;">Erreur de chargement</td></tr>`;
    }
}

// ==================== CHARGEMENT DES ENSEIGNANTS ET MATIÈRES ====================
async function chargerSelects() {
    try {
        const [repEns, repMat] = await Promise.all([
            fetch(`${API}/enseignants`, { headers: { 'Authorization': token } }),
            fetch(`${API}/matieres`, { headers: { 'Authorization': token } })
        ]);

        const enseignants = await repEns.json();
        const matieres = await repMat.json();

        const selectEns = document.getElementById('enseignant_id');
        enseignants.forEach(ens => {
            const option = document.createElement('option');
            option.value = ens.id;
            option.textContent = `${ens.nom} ${ens.prenom}`;
            selectEns.appendChild(option);
        });

        const selectMat = document.getElementById('matiere_id');
        matieres.forEach(mat => {
            const option = document.createElement('option');
            option.value = mat.id;
            option.textContent = `${mat.intitule} (${mat.niveau})`;
            selectMat.appendChild(option);
        });

    } catch (erreur) {
        console.error('Erreur chargement selects :', erreur);
    }
}

// ==================== MODAL ====================
function openModal() {
    document.getElementById('modal').classList.remove('hidden');
    document.getElementById('modalTitle').innerHTML = '<i class="fas fa-calendar-plus"></i> Ajouter une heure';
    document.getElementById('heureForm').reset();
    document.getElementById('heureId').value = '';
}

function closeModal() {
    document.getElementById('modal').classList.add('hidden');
}

// ==================== ENREGISTRER ====================
async function sauvegarderHeure(event) {
    event.preventDefault();
    const id = document.getElementById('heureId').value;
    const isEdit = !!id;

    const donnees = {
        enseignant_id: document.getElementById('enseignant_id').value,
        matiere_id: document.getElementById('matiere_id').value,
        date_cours: document.getElementById('date_cours').value,
        type_heure: document.getElementById('type_heure').value,
        duree: parseFloat(document.getElementById('duree').value),
        salle: document.getElementById('salle').value.trim(),
        observations: document.getElementById('observations').value.trim()
    };

    try {
        const reponse = await fetch(`${API}/heures${isEdit ? '/' + id : ''}`, {
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
        chargerHeures();

    } catch (erreur) {
        showToast('Erreur de connexion au serveur', 'error');
    }
}

// ==================== MODIFIER ====================
async function modifierHeure(id) {
    try {
        const reponse = await fetch(`${API}/heures`, {
            headers: { 'Authorization': token }
        });
        const donnees = await reponse.json();
        const h = donnees.find(h => h.id == id);
        if (!h) return;

        openModal();
        document.getElementById('modalTitle').innerHTML = '<i class="fas fa-edit"></i> Modifier une heure';
        document.getElementById('heureId').value = h.id;
        document.getElementById('enseignant_id').value = h.enseignant_id;
        document.getElementById('matiere_id').value = h.matiere_id;
        document.getElementById('date_cours').value = h.date_cours.split('T')[0];
        document.getElementById('type_heure').value = h.type_heure;
        document.getElementById('duree').value = h.duree;
        document.getElementById('salle').value = h.salle || '';
        document.getElementById('observations').value = h.observations || '';

    } catch (erreur) {
        showToast('Erreur de chargement', 'error');
    }
}

// ==================== SUPPRIMER ====================
async function supprimerHeure(id) {
    if (!confirm('Voulez-vous vraiment supprimer cette heure ?')) return;

    try {
        const reponse = await fetch(`${API}/heures/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': token }
        });
        const resultat = await reponse.json();

        if (!reponse.ok) {
            showToast(resultat.message, 'error');
            return;
        }

        showToast(resultat.message, 'success');
        chargerHeures();

    } catch (erreur) {
        showToast('Erreur de connexion au serveur', 'error');
    }
}

// ==================== FILTRE ====================
function filtrerHeures() {
    const recherche = document.getElementById('searchInput').value.toLowerCase();
    const lignes = document.querySelectorAll('#heuresBody tr');
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
    chargerSelects();
    chargerHeures();
});