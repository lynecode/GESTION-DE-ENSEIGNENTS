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

// ==================== CHARGEMENT DES MATIÈRES ====================
async function chargerMatieres() {
    const tbody = document.getElementById('matieresBody');
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:30px;"><i class="fas fa-spinner fa-spin"></i> Chargement...</td></tr>`;

    try {
        const reponse = await fetch(`${API}/matieres`, {
            headers: { 'Authorization': token }
        });
        const donnees = await reponse.json();

        if (donnees.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align:center;color:#888;padding:40px;">
                        <i class="fas fa-book-open" style="font-size:2rem;margin-bottom:10px;display:block;"></i>
                        Aucune matière enregistrée
                    </td>
                </tr>`;
            return;
        }

        tbody.innerHTML = donnees.map(mat => `
            <tr>
                <td><strong>${escapeHtml(mat.intitule)}</strong></td>
                <td>${escapeHtml(mat.filiere)}</td>
                <td><span class="badge badge-grade">${escapeHtml(mat.niveau)}</span></td>
                <td>${mat.volume_horaire_prevu} h</td>
                <td>
                    <button class="btn-action btn-edit" onclick="modifierMatiere(${mat.id})" title="Modifier">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-action btn-delete" onclick="supprimerMatiere(${mat.id})" title="Supprimer">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');

    } catch (erreur) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:red;padding:30px;">Erreur de chargement</td></tr>`;
    }
}

// ==================== MODAL ====================
function openModal() {
    document.getElementById('modal').classList.remove('hidden');
    document.getElementById('modalTitle').innerHTML = '<i class="fas fa-book-medical"></i> Ajouter une matière';
    document.getElementById('matiereForm').reset();
    document.getElementById('matiereId').value = '';
}

function closeModal() {
    document.getElementById('modal').classList.add('hidden');
}

// ==================== ENREGISTRER ====================
async function sauvegarderMatiere(event) {
    event.preventDefault();
    const id = document.getElementById('matiereId').value;
    const isEdit = !!id;

    const donnees = {
        intitule: document.getElementById('intitule').value.trim(),
        filiere: document.getElementById('filiere').value.trim(),
        niveau: document.getElementById('niveau').value,
        volume_horaire_prevu: parseInt(document.getElementById('volume_horaire_prevu').value)
    };

    try {
        const reponse = await fetch(`${API}/matieres${isEdit ? '/' + id : ''}`, {
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
        chargerMatieres();

    } catch (erreur) {
        showToast('Erreur de connexion au serveur', 'error');
    }
}

// ==================== MODIFIER ====================
async function modifierMatiere(id) {
    try {
        const reponse = await fetch(`${API}/matieres`, {
            headers: { 'Authorization': token }
        });
        const donnees = await reponse.json();
        const mat = donnees.find(m => m.id == id);
        if (!mat) return;

        openModal();
        document.getElementById('modalTitle').innerHTML = '<i class="fas fa-edit"></i> Modifier une matière';
        document.getElementById('matiereId').value = mat.id;
        document.getElementById('intitule').value = mat.intitule;
        document.getElementById('filiere').value = mat.filiere;
        document.getElementById('niveau').value = mat.niveau;
        document.getElementById('volume_horaire_prevu').value = mat.volume_horaire_prevu;

    } catch (erreur) {
        showToast('Erreur de chargement', 'error');
    }
}

// ==================== SUPPRIMER ====================
async function supprimerMatiere(id) {
    if (!confirm('Voulez-vous vraiment supprimer cette matière ?')) return;

    try {
        const reponse = await fetch(`${API}/matieres/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': token }
        });
        const resultat = await reponse.json();

        if (!reponse.ok) {
            showToast(resultat.message, 'error');
            return;
        }

        showToast(resultat.message, 'success');
        chargerMatieres();

    } catch (erreur) {
        showToast('Erreur de connexion au serveur', 'error');
    }
}

// ==================== FILTRE ====================
function filtrerMatieres() {
    const recherche = document.getElementById('searchInput').value.toLowerCase();
    const lignes = document.querySelectorAll('#matieresBody tr');
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
    chargerMatieres();
});