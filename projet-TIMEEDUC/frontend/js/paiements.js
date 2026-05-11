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
let donneesLignes = [];

// ==================== DÉCONNEXION ====================
function deconnexion() {
    localStorage.clear();
    window.location.href = '../../../index.html';
}

// ==================== CHARGEMENT DES PAIEMENTS ====================
async function chargerPaiements() {
    const tbody = document.getElementById('paiementsBody');
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;padding:30px;"><i class="fas fa-spinner fa-spin"></i> Chargement...</td></tr>`;

    try {
        const reponse = await fetch(`${API}/enseignants`, {
            headers: { 'Authorization': token }
        });
        const enseignants = await reponse.json();

        if (enseignants.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="9" style="text-align:center;color:#888;padding:40px;">
                        <i class="fas fa-users" style="font-size:2rem;margin-bottom:10px;display:block;"></i>
                        Aucun enseignant enregistré
                    </td>
                </tr>`;
            return;
        }

        let montantGeneral = 0;
        const lignes = [];

        await Promise.all(enseignants.map(async (ens) => {
            const rep = await fetch(`${API}/heures/recapitulatif/${ens.id}`, {
                headers: { 'Authorization': token }
            });
            const d = await rep.json();
            montantGeneral += d.montant_total || 0;
            lignes.push({ ens, d });
        }));

        donneesLignes = lignes;

        tbody.innerHTML = lignes.map(({ ens, d }) => `
            <tr>
                <td><strong>${escapeHtml(d.nom)} ${escapeHtml(d.prenom)}</strong></td>
                <td><span class="badge badge-grade">${escapeHtml(d.grade)}</span></td>
                <td>${escapeHtml(d.departement)}</td>
                <td style="text-align:center;">${d.total_heures} h</td>
                <td style="text-align:center;">${d.heures_contractuelles} h</td>
                <td style="text-align:center;color:#f0c027;font-weight:600;">${d.heures_complementaires} h</td>
                <td style="text-align:center;">${d.taux_horaire} FCFA</td>
                <td style="text-align:center;color:#2e7d32;font-weight:700;">${(d.montant_total || 0).toLocaleString('fr-FR')} FCFA</td>
                <td>
                    <button class="btn-action btn-view" onclick="voirDetails(${ens.id})" title="Voir détails">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            </tr>
        `).join('');

        document.getElementById('montantGeneral').textContent = montantGeneral.toLocaleString('fr-FR') + ' FCFA';

    } catch (erreur) {
        tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;color:red;padding:30px;">Erreur de chargement</td></tr>`;
    }
}

// ==================== VOIR DÉTAILS ====================
async function voirDetails(id) {
    try {
        const reponse = await fetch(`${API}/heures/recapitulatif/${id}`, {
            headers: { 'Authorization': token }
        });
        const d = await reponse.json();

        document.getElementById('detailsPaiement').innerHTML = `
            <div id="zonePaiementImpression">
                <div style="text-align:center;margin-bottom:20px;padding-bottom:15px;border-bottom:3px solid #f0c027;">
                    <h2 style="color:#1a2a4a;">TimeEduc</h2>
                    <p style="color:#888;">Fiche de paiement - ${new Date().toLocaleDateString('fr-FR')}</p>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:15px;margin-bottom:20px;">
                    <div style="background:#f8f9fa;padding:15px;border-radius:8px;">
                        <span style="color:#888;font-size:0.85rem;">Nom complet</span>
                        <p style="color:#1a2a4a;font-weight:600;">${escapeHtml(d.nom)} ${escapeHtml(d.prenom)}</p>
                    </div>
                    <div style="background:#f8f9fa;padding:15px;border-radius:8px;">
                        <span style="color:#888;font-size:0.85rem;">Grade</span>
                        <p style="color:#1a2a4a;font-weight:600;">${escapeHtml(d.grade)}</p>
                    </div>
                    <div style="background:#f8f9fa;padding:15px;border-radius:8px;">
                        <span style="color:#888;font-size:0.85rem;">Département</span>
                        <p style="color:#1a2a4a;font-weight:600;">${escapeHtml(d.departement)}</p>
                    </div>
                    <div style="background:#f8f9fa;padding:15px;border-radius:8px;">
                        <span style="color:#888;font-size:0.85rem;">Statut</span>
                        <p style="color:#1a2a4a;font-weight:600;">${escapeHtml(d.statut)}</p>
                    </div>
                </div>

                <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
                    <thead>
                        <tr style="background:#1a2a4a;color:white;">
                            <th style="padding:10px;">Type</th>
                            <th style="padding:10px;text-align:center;">Heures</th>
                            <th style="padding:10px;text-align:center;">Statut</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr style="border-bottom:1px solid #eee;">
                            <td style="padding:10px;">CM</td>
                            <td style="padding:10px;text-align:center;">${d.total_cm} h</td>
                            <td style="padding:10px;text-align:center;"><span style="background:#e3f2fd;color:#1a2a4a;padding:2px 8px;border-radius:10px;font-size:0.8rem;">Normale</span></td>
                        </tr>
                        <tr style="background:#f8f9fa;border-bottom:1px solid #eee;">
                            <td style="padding:10px;">TD</td>
                            <td style="padding:10px;text-align:center;">${d.total_td} h</td>
                            <td style="padding:10px;text-align:center;"><span style="background:#e3f2fd;color:#1a2a4a;padding:2px 8px;border-radius:10px;font-size:0.8rem;">Normale</span></td>
                        </tr>
                        <tr style="border-bottom:1px solid #eee;">
                            <td style="padding:10px;">TP</td>
                            <td style="padding:10px;text-align:center;">${d.total_tp} h</td>
                            <td style="padding:10px;text-align:center;"><span style="background:#e3f2fd;color:#1a2a4a;padding:2px 8px;border-radius:10px;font-size:0.8rem;">Normale</span></td>
                        </tr>
                        <tr style="border-bottom:1px solid #eee;">
                            <td style="padding:10px;">Heures complémentaires</td>
                            <td style="padding:10px;text-align:center;">${d.heures_complementaires} h</td>
                            <td style="padding:10px;text-align:center;"><span style="background:#fff3e0;color:#f57c00;padding:2px 8px;border-radius:10px;font-size:0.8rem;">Complémentaire</span></td>
                        </tr>
                        <tr style="background:#1a2a4a;color:white;">
                            <td style="padding:10px;font-weight:bold;">Total</td>
                            <td style="padding:10px;text-align:center;font-weight:bold;">${d.total_heures} h</td>
                            <td style="padding:10px;"></td>
                        </tr>
                    </tbody>
                </table>

                <div style="display:grid;grid-template-columns:1fr 1fr;gap:15px;">
                    <div style="background:#fff3e0;padding:15px;border-radius:8px;">
                        <span style="color:#888;font-size:0.85rem;">Heures complémentaires</span>
                        <p style="color:#f57c00;font-weight:700;font-size:1.2rem;">${d.heures_complementaires} h</p>
                    </div>
                    <div style="background:#e8f5e9;padding:15px;border-radius:8px;">
                        <span style="color:#888;font-size:0.85rem;">Montant total à payer</span>
                        <p style="color:#2e7d32;font-weight:700;font-size:1.2rem;">${(d.montant_total || 0).toLocaleString('fr-FR')} FCFA</p>
                    </div>
                </div>

                <div style="margin-top:20px;text-align:center;">
                    <button onclick="imprimerFiche()" class="btn-primary">
                        <i class="fas fa-print"></i> Imprimer cette fiche
                    </button>
                </div>
            </div>
        `;

        document.getElementById('modalDetails').classList.remove('hidden');

    } catch (erreur) {
        console.error('Erreur chargement détails :', erreur);
    }
}

// ==================== IMPRESSION FICHE INDIVIDUELLE ====================
function imprimerFiche() {
    const zone = document.getElementById('zonePaiementImpression');
    const contenuOriginal = document.body.innerHTML;

    document.body.innerHTML = `
        <style>
            body { font-family: 'Segoe UI', sans-serif; padding: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 10px; border: 1px solid #ddd; }
            th { background: #1a2a4a; color: white; }
            button { display: none; }
        </style>
        ${zone.innerHTML}
    `;
    window.print();
    document.body.innerHTML = contenuOriginal;
    window.location.reload();
}

// ==================== IMPRESSION ÉTAT GLOBAL ====================
function imprimerEtat() {
    const dateAujourdhui = new Date().toLocaleDateString('fr-FR');
    const lignesHtml = donneesLignes.map(({ d }) => `
        <tr>
            <td>${escapeHtml(d.nom)} ${escapeHtml(d.prenom)}</td>
            <td>${escapeHtml(d.grade)}</td>
            <td>${escapeHtml(d.departement)}</td>
            <td style="text-align:center;">${d.total_heures} h</td>
            <td style="text-align:center;">${d.heures_contractuelles} h</td>
            <td style="text-align:center;">${d.heures_complementaires} h</td>
            <td style="text-align:center;">${d.taux_horaire} FCFA</td>
            <td style="text-align:center;">${(d.montant_total || 0).toLocaleString('fr-FR')} FCFA</td>
        </tr>
    `).join('');

    const contenuOriginal = document.body.innerHTML;

    document.body.innerHTML = `
        <style>
            body { font-family: 'Segoe UI', sans-serif; padding: 20px; }
            h2 { color: #1a2a4a; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background: #1a2a4a; color: white; padding: 10px; text-align: left; }
            td { padding: 10px; border-bottom: 1px solid #ddd; }
            tr:nth-child(even) { background: #f8f9fa; }
            .total { text-align: right; margin-top: 15px; font-size: 1.1rem; font-weight: bold; color: #1a2a4a; }
        </style>
        <h2>TimeEduc - État global des paiements</h2>
        <p style="color:#888;">Généré le : ${dateAujourdhui}</p>
        <table>
            <thead>
                <tr>
                    <th>Enseignant</th>
                    <th>Grade</th>
                    <th>Département</th>
                    <th>Total heures</th>
                    <th>H. contractuelles</th>
                    <th>H. complémentaires</th>
                    <th>Taux horaire</th>
                    <th>Montant total</th>
                </tr>
            </thead>
            <tbody>${lignesHtml}</tbody>
        </table>
        <p class="total">Montant général : ${document.getElementById('montantGeneral').textContent}</p>
    `;
    window.print();
    document.body.innerHTML = contenuOriginal;
    window.location.reload();
}

// ==================== FERMER MODAL ====================
function closeModal() {
    document.getElementById('modalDetails').classList.add('hidden');
}

document.getElementById('modalDetails')?.addEventListener('click', function(e) {
    if (e.target === this) closeModal();
});

// ==================== FILTRE ====================
function filtrerPaiements() {
    const recherche = document.getElementById('searchInput').value.toLowerCase();
    const lignes = document.querySelectorAll('#paiementsBody tr');
    lignes.forEach(ligne => {
        ligne.style.display = ligne.textContent.toLowerCase().includes(recherche) ? '' : 'none';
    });
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
    chargerPaiements();
});