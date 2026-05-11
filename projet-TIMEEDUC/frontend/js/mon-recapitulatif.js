// ==================== AUTHENTIFICATION ====================
const token = localStorage.getItem('token');
const role = localStorage.getItem('role');
const enseignantId = localStorage.getItem('enseignantId');

if (!token || role !== 'enseignant') {
    window.location.href = '../../../index.html';
}

const nomUser = localStorage.getItem('nom') || 'Enseignant';
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
    const contenu = document.getElementById('contenuRecapitulatif');

    try {
        const reponse = await fetch(`${API}/heures/recapitulatif/${enseignantId}`, {
            headers: { 'Authorization': token }
        });
        const d = await reponse.json();

        const dateAujourdhui = new Date().toLocaleDateString('fr-FR');

        contenu.innerHTML = `
            <div id="zoneImpression">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:30px;padding-bottom:20px;border-bottom:3px solid #f0c027;">
                    <div>
                        <h2 style="color:#1a2a4a;font-size:1.5rem;">
                            <i class="fas fa-clock" style="color:#f0c027;"></i> TimeEduc
                        </h2>
                        <p style="color:#888;font-size:0.9rem;">Fiche récapitulative des heures</p>
                    </div>
                    <div style="text-align:right;">
                        <p style="color:#888;font-size:0.9rem;">Date : ${dateAujourdhui}</p>
                    </div>
                </div>

                <div style="background:#f8f9fa;border-radius:10px;padding:20px;margin-bottom:25px;">
                    <h3 style="color:#1a2a4a;margin-bottom:15px;">
                        <i class="fas fa-user" style="color:#f0c027;"></i> Informations personnelles
                    </h3>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:15px;">
                        <div>
                            <span style="color:#888;font-size:0.85rem;">Nom complet</span>
                            <p style="color:#1a2a4a;font-weight:600;">${escapeHtml(d.nom)} ${escapeHtml(d.prenom)}</p>
                        </div>
                        <div>
                            <span style="color:#888;font-size:0.85rem;">Grade</span>
                            <p style="color:#1a2a4a;font-weight:600;">${escapeHtml(d.grade)}</p>
                        </div>
                        <div>
                            <span style="color:#888;font-size:0.85rem;">Statut</span>
                            <p style="color:#1a2a4a;font-weight:600;">${escapeHtml(d.statut)}</p>
                        </div>
                        <div>
                            <span style="color:#888;font-size:0.85rem;">Département</span>
                            <p style="color:#1a2a4a;font-weight:600;">${escapeHtml(d.departement)}</p>
                        </div>
                    </div>
                </div>

                <div style="margin-bottom:25px;">
                    <h3 style="color:#1a2a4a;margin-bottom:15px;">
                        <i class="fas fa-clock" style="color:#f0c027;"></i> Récapitulatif des heures
                    </h3>
                    <table style="width:100%;border-collapse:collapse;">
                        <thead>
                            <tr style="background:#1a2a4a;color:white;">
                                <th style="padding:12px;text-align:left;">Type</th>
                                <th style="padding:12px;text-align:center;">Heures effectuées</th>
                                <th style="padding:12px;text-align:center;">Statut</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr style="border-bottom:1px solid #eee;">
                                <td style="padding:12px;">Cours Magistraux (CM)</td>
                                <td style="padding:12px;text-align:center;font-weight:600;">${d.total_cm} h</td>
                                <td style="padding:12px;text-align:center;">
                                    <span style="background:#e3f2fd;color:#1a2a4a;padding:3px 10px;border-radius:20px;font-size:0.8rem;">Normale</span>
                                </td>
                            </tr>
                            <tr style="background:#f8f9fa;border-bottom:1px solid #eee;">
                                <td style="padding:12px;">Travaux Dirigés (TD)</td>
                                <td style="padding:12px;text-align:center;font-weight:600;">${d.total_td} h</td>
                                <td style="padding:12px;text-align:center;">
                                    <span style="background:#e3f2fd;color:#1a2a4a;padding:3px 10px;border-radius:20px;font-size:0.8rem;">Normale</span>
                                </td>
                            </tr>
                            <tr style="border-bottom:1px solid #eee;">
                                <td style="padding:12px;">Travaux Pratiques (TP)</td>
                                <td style="padding:12px;text-align:center;font-weight:600;">${d.total_tp} h</td>
                                <td style="padding:12px;text-align:center;">
                                    <span style="background:#e3f2fd;color:#1a2a4a;padding:3px 10px;border-radius:20px;font-size:0.8rem;">Normale</span>
                                </td>
                            </tr>
                            <tr style="border-bottom:1px solid #eee;">
                                <td style="padding:12px;">Heures complémentaires</td>
                                <td style="padding:12px;text-align:center;font-weight:600;">${d.heures_complementaires} h</td>
                                <td style="padding:12px;text-align:center;">
                                    <span style="background:#fff3e0;color:#f57c00;padding:3px 10px;border-radius:20px;font-size:0.8rem;">Complémentaire</span>
                                </td>
                            </tr>
                            <tr style="background:#1a2a4a;color:white;">
                                <td style="padding:12px;font-weight:bold;">Total heures</td>
                                <td style="padding:12px;text-align:center;font-weight:bold;">${d.total_heures} h</td>
                                <td style="padding:12px;"></td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div style="background:#f8f9fa;border-radius:10px;padding:20px;margin-bottom:25px;">
                    <h3 style="color:#1a2a4a;margin-bottom:15px;">
                        <i class="fas fa-money-bill-wave" style="color:#f0c027;"></i> Calcul financier
                    </h3>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:15px;">
                        <div style="background:white;padding:15px;border-radius:8px;">
                            <span style="color:#888;font-size:0.85rem;">Heures contractuelles</span>
                            <p style="color:#1a2a4a;font-weight:600;font-size:1.2rem;">${d.heures_contractuelles} h</p>
                        </div>
                        <div style="background:white;padding:15px;border-radius:8px;">
                            <span style="color:#888;font-size:0.85rem;">Heures normales effectuées</span>
                            <p style="color:#27ae60;font-weight:600;font-size:1.2rem;">${d.heures_normales} h</p>
                        </div>
                        <div style="background:#fff3e0;padding:15px;border-radius:8px;">
                            <span style="color:#888;font-size:0.85rem;">Heures complémentaires</span>
                            <p style="color:#f57c00;font-weight:600;font-size:1.2rem;">${d.heures_complementaires} h</p>
                        </div>
                        <div style="background:white;padding:15px;border-radius:8px;">
                            <span style="color:#888;font-size:0.85rem;">Taux horaire</span>
                            <p style="color:#1a2a4a;font-weight:600;font-size:1.2rem;">${d.taux_horaire} FCFA</p>
                        </div>
                        <div style="background:#e8f5e9;padding:15px;border-radius:8px;grid-column:1/-1;">
                            <span style="color:#888;font-size:0.85rem;">Montant total à payer</span>
                            <p style="color:#2e7d32;font-weight:700;font-size:1.6rem;">${d.montant_total.toLocaleString('fr-FR')} FCFA</p>
                        </div>
                    </div>
                </div>
            </div>
        `;

    } catch (erreur) {
        contenu.innerHTML = `<div style="text-align:center;color:red;padding:40px;">Erreur de chargement</div>`;
    }
}

// ==================== IMPRESSION SPÉCIFIQUE ====================
function imprimerRecapitulatif() {
    const zoneImpression = document.getElementById('zoneImpression');
    const contenuOriginal = document.body.innerHTML;

    document.body.innerHTML = `
        <style>
            body { font-family: 'Segoe UI', sans-serif; padding: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 10px; border: 1px solid #ddd; }
            th { background: #1a2a4a; color: white; }
        </style>
        ${zoneImpression.innerHTML}
    `;

    window.print();
    document.body.innerHTML = contenuOriginal;
    window.location.reload();
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
    chargerRecapitulatif();
});