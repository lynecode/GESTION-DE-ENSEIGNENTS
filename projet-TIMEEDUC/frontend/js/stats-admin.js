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
        afficherGraphiqueDepartements(heures, enseignants);
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
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });
}

// ==================== GRAPHIQUE DÉPARTEMENTS ====================
function afficherGraphiqueDepartements(heures, enseignants) {
    const departements = {};

    enseignants.forEach(ens => {
        const heuresEns = heures.filter(h => h.enseignant_id === ens.id);
        const total = heuresEns.reduce((s, h) => s + parseFloat(h.duree), 0);
        if (!departements[ens.departement]) departements[ens.departement] = 0;
        departements[ens.departement] += total;
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
            scales: {
                y: { beginAtZero: true, ticks: { stepSize: 1 } }
            }
        }
    });
}

// ==================== DÉPASSEMENTS ====================
async function afficherDepassements(enseignants) {
    const tbody = document.getElementById('corpsDepassements');
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:20px;"><i class="fas fa-spinner fa-spin"></i></td></tr>`;

    try {
        const lignes = [];

        await Promise.all(enseignants.map(async (ens) => {
            const rep = await fetch(`${API}/heures/recapitulatif/${ens.id}`, {
                headers: { 'Authorization': token }
            });
            const d = await rep.json();
            if (d.heures_complementaires > 0) lignes.push(d);
        }));

        if (lignes.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align:center;color:#888;padding:30px;">
                        <i class="fas fa-check-circle" style="color:#27ae60;font-size:2rem;display:block;margin-bottom:10px;"></i>
                        Aucun enseignant en dépassement
                    </td>
                </tr>`;
            return;
        }

        tbody.innerHTML = lignes.map(d => `
            <tr>
                <td><strong>${escapeHtml(d.nom)} ${escapeHtml(d.prenom)}</strong></td>
                <td>${escapeHtml(d.departement)}</td>
                <td style="text-align:center;">${d.heures_contractuelles} h</td>
                <td style="text-align:center;">${d.total_heures} h</td>
                <td style="text-align:center;color:#e74c3c;font-weight:700;">+${d.heures_complementaires} h</td>
            </tr>
        `).join('');

    } catch (erreur) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:red;">Erreur de chargement</td></tr>`;
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
});