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
        const [repHeures, repEnseignants] = await Promise.all([
            fetch(`${API}/heures`, { headers: { 'Authorization': token } }),
            fetch(`${API}/enseignants`, { headers: { 'Authorization': token } })
        ]);

        const heures = await repHeures.json();
        const enseignants = await repEnseignants.json();

        afficherGraphiqueTypes(heures);
        afficherGraphiqueDepartements(heures);
        afficherDepassements(enseignants);

    } catch (erreur) {
        console.error('Erreur chargement statistiques :', erreur);
    }
}

// ==================== GRAPHIQUE TYPES ====================
function afficherGraphiqueTypes(heures) {
    const totalCM = heures.filter(h => h.type_heure === 'CM').reduce((s, h) => s + parseFloat(h.duree), 0);
    const totalTD = heures.filter(h => h.type_heure === 'TD').reduce((s, h) => s + parseFloat(h.duree), 0);
    const totalTP = heures.filter(h => h.type_heure === 'TP').reduce((s, h) => s + parseFloat(h.duree), 0);

    if (totalCM === 0 && totalTD === 0 && totalTP === 0) {
        document.getElementById('graphiqueTypes').parentElement.innerHTML += `
            <p style="text-align:center;color:#888;margin-top:20px;">Aucune heure enregistrée</p>`;
        return;
    }

    new Chart(document.getElementById('graphiqueTypes'), {
        type: 'doughnut',
        data: {
            labels: ['CM', 'TD', 'TP'],
            datasets: [{
                data: [totalCM, totalTD, totalTP],
                backgroundColor: ['#1a2a4a', '#f0c027', '#27ae60'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { position: 'bottom' } }
        }
    });
}

// ==================== GRAPHIQUE DÉPARTEMENTS ====================
function afficherGraphiqueDepartements(heures) {
    const departements = {};

    heures.forEach(h => {
        const dept = h.departement || 'Non défini';
        if (!departements[dept]) departements[dept] = 0;
        departements[dept] += parseFloat(h.duree);
    });

    const labels = Object.keys(departements);
    const valeurs = Object.values(departements);

    if (labels.length === 0) {
        document.getElementById('graphiqueDepartements').parentElement.innerHTML += `
            <p style="text-align:center;color:#888;margin-top:20px;">Aucune donnée disponible</p>`;
        return;
    }

    new Chart(document.getElementById('graphiqueDepartements'), {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Heures effectuées',
                data: valeurs,
                backgroundColor: '#1a2a4a',
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
        }
    });
}

// ==================== DÉPASSEMENTS ====================
async function afficherDepassements(enseignants) {
    const tbody = document.getElementById('corpsDepassements');
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:20px;"><i class="fas fa-spinner fa-spin"></i></td></tr>`;

    try {
        const lignes = [];

        await Promise.all(enseignants.map(async (ens) => {
            const rep = await fetch(`${API}/heures/recapitulatif/${ens.id}`, {
                headers: { 'Authorization': token }
            });
            const d = await rep.json();
            lignes.push(d);
        }));

        if (lignes.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:#888;padding:30px;">Aucun enseignant enregistré</td></tr>`;
            return;
        }

        tbody.innerHTML = lignes.map(d => {
            const pourcentage = d.heures_contractuelles > 0
                ? Math.round((d.total_heures / d.heures_contractuelles) * 100)
                : 0;

            const couleurBarre = pourcentage >= 100 ? '#e74c3c' : pourcentage >= 80 ? '#f0c027' : '#27ae60';
            const statut = d.heures_complementaires > 0
                ? `<span style="background:#ffebee;color:#e74c3c;padding:4px 10px;border-radius:20px;font-size:0.8rem;font-weight:600;">En dépassement</span>`
                : `<span style="background:#e8f5e9;color:#27ae60;padding:4px 10px;border-radius:20px;font-size:0.8rem;font-weight:600;">Normal</span>`;

            return `
            <tr>
                <td><strong>${escapeHtml(d.nom)} ${escapeHtml(d.prenom)}</strong></td>
                <td>${escapeHtml(d.departement)}</td>
                <td style="text-align:center;">${d.heures_contractuelles} h</td>
                <td style="text-align:center;">${d.total_heures} h</td>
                <td style="text-align:center;color:#e74c3c;font-weight:700;">${d.heures_complementaires > 0 ? '+' + d.heures_complementaires + ' h' : '-'}</td>
                <td style="text-align:center;">
                    <div style="background:#eee;border-radius:10px;height:10px;width:100%;min-width:80px;">
                        <div style="background:${couleurBarre};width:${Math.min(pourcentage, 100)}%;height:10px;border-radius:10px;"></div>
                    </div>
                    <small style="color:#888;">${pourcentage}%</small>
                </td>
                <td style="text-align:center;">${statut}</td>
            </tr>`;
        }).join('');

    } catch (erreur) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:red;">Erreur de chargement</td></tr>`;
    }
}

// ==================== IMPRESSION DÉPASSEMENTS ====================
function imprimerDepassements() {
    const dateAujourdhui = new Date().toLocaleDateString('fr-FR');
    const tbody = document.getElementById('corpsDepassements').innerHTML;
    const contenuOriginal = document.body.innerHTML;

    document.body.innerHTML = `
        <style>
            body { font-family: 'Segoe UI', sans-serif; padding: 20px; }
            h2 { color: #1a2a4a; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background: #1a2a4a; color: white; padding: 10px; text-align: left; }
            td { padding: 10px; border-bottom: 1px solid #ddd; font-size: 0.9rem; }
            tr:nth-child(even) { background: #f8f9fa; }
        </style>
        <h2>TimeEduc - Suivi des heures enseignants</h2>
        <p style="color:#888;">Généré le : ${dateAujourdhui}</p>
        <table>
            <thead>
                <tr>
                    <th>Enseignant</th>
                    <th>Département</th>
                    <th>H. contractuelles</th>
                    <th>H. effectuées</th>
                    <th>Dépassement</th>
                    <th>Progression</th>
                    <th>Statut</th>
                </tr>
            </thead>
            <tbody>${tbody}</tbody>
        </table>
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
    chargerStatistiques();
    document.getElementById('btnImprimer').addEventListener('click', imprimerDepassements);
});