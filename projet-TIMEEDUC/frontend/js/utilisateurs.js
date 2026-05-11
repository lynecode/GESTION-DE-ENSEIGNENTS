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
let tousLesUtilisateurs = [];
const motsDePasse = {};

// ==================== DÉCONNEXION ====================
function deconnexion() {
    localStorage.clear();
    window.location.href = '../../../index.html';
}

// ==================== CHARGEMENT ====================
async function chargerUtilisateurs() {
    const tbody = document.getElementById('utilisateursBody');
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:30px;"><i class="fas fa-spinner fa-spin"></i> Chargement...</td></tr>`;

    try {
        const reponse = await fetch(`${API}/utilisateurs`, {
            headers: { 'Authorization': token }
        });
        tousLesUtilisateurs = await reponse.json();
        const btnActif = document.querySelector('.btn-onglet.actif');
        filtrerParRole('tous', btnActif);
    } catch (erreur) {
        document.getElementById('utilisateursBody').innerHTML = `<tr><td colspan="7" style="text-align:center;color:red;padding:30px;">Erreur de chargement</td></tr>`;
    }
}

// ==================== ONGLETS ====================
function filtrerParRole(roleChoisi, bouton) {
    document.querySelectorAll('.btn-onglet').forEach(b => b.classList.remove('actif'));
    if (bouton) bouton.classList.add('actif');

    const tbody = document.getElementById('utilisateursBody');
    const filtres = roleChoisi === 'tous'
        ? tousLesUtilisateurs
        : tousLesUtilisateurs.filter(u => u.role === roleChoisi);

    if (filtres.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align:center;color:#888;padding:40px;">
                    <i class="fas fa-users" style="font-size:2rem;margin-bottom:10px;display:block;"></i>
                    Aucun utilisateur dans cette catégorie
                </td>
            </tr>`;
        return;
    }

    tbody.innerHTML = filtres.map(u => {
        motsDePasse[u.id] = u.mot_de_passe_affichage || '';
        return `
        <tr>
            <td><strong>${escapeHtml(u.nom)}</strong></td>
            <td>${escapeHtml(u.prenom)}</td>
            <td>${escapeHtml(u.email)}</td>
            <td>
                <div style="display:flex;align-items:center;gap:8px;">
                    <span id="mdp-${u.id}" style="font-family:monospace;letter-spacing:2px;">••••••••</span>
                    <button onclick="toggleMotDePasse(${u.id})"
                        style="background:none;border:none;cursor:pointer;color:#1a2a4a;font-size:0.9rem;">
                        <i class="fas fa-eye" id="icon-${u.id}"></i>
                    </button>
                </div>
            </td>
            <td><span class="badge badge-grade">${getRoleLabel(u.role)}</span></td>
            <td>${new Date(u.created_at).toLocaleDateString('fr-FR')}</td>
            <td>
                <button class="btn-action btn-edit" onclick="ouvrirModalMotDePasse(${u.id})" title="Changer mot de passe">
                    <i class="fas fa-key"></i>
                </button>
                ${u.role !== 'admin' ? `
                <button class="btn-action btn-delete" onclick="supprimerUtilisateur(${u.id})" title="Supprimer">
                    <i class="fas fa-trash"></i>
                </button>` : ''}
            </td>
        </tr>`;
    }).join('');
}

function toggleMotDePasse(id) {
    const span = document.getElementById(`mdp-${id}`);
    const icon = document.getElementById(`icon-${id}`);
    if (span.textContent === '••••••••') {
        span.textContent = motsDePasse[id] || 'Non disponible';
        icon.className = 'fas fa-eye-slash';
    } else {
        span.textContent = '••••••••';
        icon.className = 'fas fa-eye';
    }
}

// ==================== LABEL RÔLE ====================
function getRoleLabel(role) {
    switch (role) {
        case 'admin': return 'Administrateur';
        case 'rh': return 'Ressources Humaines';
        case 'enseignant': return 'Enseignant';
        default: return role;
    }
}

// ==================== DROPDOWN ====================
function toggleDropdownCreation(event) {
    event.stopPropagation();
    const dropdown = document.getElementById('dropdownCreation');
    dropdown.classList.toggle('hidden');
}

function ouvrirModalRole(roleChoisi) {
    document.getElementById('dropdownCreation').classList.add('hidden');
    document.getElementById('utilisateurForm').reset();
    document.getElementById('role').value = roleChoisi;

    const titres = {
        'admin': '<i class="fas fa-user-shield"></i> Créer un administrateur',
        'rh': '<i class="fas fa-user-tie"></i> Créer un agent RH',
        'enseignant': '<i class="fas fa-chalkboard-teacher"></i> Créer un enseignant'
    };

    document.getElementById('modalTitle').innerHTML = titres[roleChoisi];

    if (roleChoisi === 'enseignant') {
        document.getElementById('champsEnseignant').style.display = 'block';
        document.getElementById('grade').required = true;
        document.getElementById('statut').required = true;
        document.getElementById('departement').required = true;
        document.getElementById('taux_horaire').required = true;
        document.getElementById('heures_contractuelles').required = true;
    } else {
        document.getElementById('champsEnseignant').style.display = 'none';
        document.getElementById('grade').required = false;
        document.getElementById('statut').required = false;
        document.getElementById('departement').required = false;
        document.getElementById('taux_horaire').required = false;
        document.getElementById('heures_contractuelles').required = false;
    }

    document.getElementById('modal').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('modal').classList.add('hidden');
}

// ==================== ENREGISTRER ====================
async function sauvegarderUtilisateur(event) {
    event.preventDefault();
    const roleChoisi = document.getElementById('role').value;

    const donnees = {
        nom: document.getElementById('nom').value.trim(),
        prenom: document.getElementById('prenom').value.trim(),
        email: document.getElementById('email').value.trim(),
        mot_de_passe: document.getElementById('mot_de_passe').value,
        role: roleChoisi
    };

    if (roleChoisi === 'enseignant') {
        donnees.grade = document.getElementById('grade').value;
        donnees.statut = document.getElementById('statut').value;
        donnees.departement = document.getElementById('departement').value.trim();
        donnees.taux_horaire = parseFloat(document.getElementById('taux_horaire').value);
        donnees.heures_contractuelles = parseInt(document.getElementById('heures_contractuelles').value);
    }

    try {
        const url = roleChoisi === 'enseignant' ? `${API}/enseignants` : `${API}/utilisateurs`;
        const reponse = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token
            },
            body: JSON.stringify(donnees)
        });

        const resultat = await reponse.json();
        if (!reponse.ok) { showToast(resultat.message, 'error'); return; }

        showToast(resultat.message, 'success');
        closeModal();
        chargerUtilisateurs();

    } catch (erreur) {
        showToast('Erreur de connexion au serveur', 'error');
    }
}

// ==================== SUPPRIMER ====================
async function supprimerUtilisateur(id) {
    if (!confirm('Voulez-vous vraiment supprimer cet utilisateur ?')) return;

    try {
        const reponse = await fetch(`${API}/utilisateurs/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': token }
        });
        const resultat = await reponse.json();
        if (!reponse.ok) { showToast(resultat.message, 'error'); return; }
        showToast(resultat.message, 'success');
        chargerUtilisateurs();
    } catch (erreur) {
        showToast('Erreur de connexion au serveur', 'error');
    }
}

// ==================== MOT DE PASSE ====================
function ouvrirModalMotDePasse(id) {
    document.getElementById('utilisateurId').value = id;
    document.getElementById('motDePasseForm').reset();
    document.getElementById('modalMotDePasse').classList.remove('hidden');
}

function closeModalMotDePasse() {
    document.getElementById('modalMotDePasse').classList.add('hidden');
}

async function sauvegarderMotDePasse(event) {
    event.preventDefault();
    const id = document.getElementById('utilisateurId').value;
    const mot_de_passe = document.getElementById('nouveauMotDePasse').value;

    try {
        const reponse = await fetch(`${API}/utilisateurs/${id}/mot-de-passe`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': token },
            body: JSON.stringify({ mot_de_passe })
        });
        const resultat = await reponse.json();
        if (!reponse.ok) { showToast(resultat.message, 'error'); return; }
        showToast(resultat.message, 'success');
        closeModalMotDePasse();
        chargerUtilisateurs();
    } catch (erreur) {
        showToast('Erreur de connexion au serveur', 'error');
    }
}

// ==================== FILTRE RECHERCHE ====================
function filtrerUtilisateurs() {
    const recherche = document.getElementById('searchInput').value.toLowerCase();
    const lignes = document.querySelectorAll('#utilisateursBody tr');
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
    setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 300); }, 3000);
}

// ==================== MENU ====================
function toggleMenu() {
    document.getElementById('navBar').classList.toggle('active');
}

document.addEventListener('click', function(e) {
    const navBar = document.getElementById('navBar');
    if (navBar && !navBar.contains(e.target)) navBar.classList.remove('active');
    
    const dropdown = document.getElementById('dropdownCreation');
    const container = document.querySelector('.dropdown-container');
    if (dropdown && container && !container.contains(e.target)) {
        dropdown.classList.add('hidden');
    }
});

document.getElementById('modal')?.addEventListener('click', function(e) {
    if (e.target === this) closeModal();
});

document.getElementById('modalMotDePasse')?.addEventListener('click', function(e) {
    if (e.target === this) closeModalMotDePasse();
});

// ==================== UTILITAIRE ====================
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// ==================== INITIALISATION ====================
document.addEventListener('DOMContentLoaded', () => {
    chargerUtilisateurs();
});