const db = require('../config/db');
const bcrypt = require('bcryptjs');
const XLSX = require('xlsx');
const fs = require('fs');

exports.importerEnseignants = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'Aucun fichier envoyé' });

        const workbook = XLSX.readFile(req.file.path);
        const feuille = workbook.Sheets[workbook.SheetNames[0]];
        const donnees = XLSX.utils.sheet_to_json(feuille);

        if (donnees.length === 0) {
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ message: 'Le fichier est vide' });
        }

        let succes = 0;
        let erreurs = 0;

        for (const ligne of donnees) {
            try {
                const nom = ligne['Nom'] || ligne['nom'] || '';
                const prenom = ligne['Prénom'] || ligne['prenom'] || '';
                const email = ligne['Email'] || ligne['email'] || '';
                const grade = ligne['Grade'] || ligne['grade'] || 'Autres';
                const statut = ligne['Statut'] || ligne['statut'] || 'Permanent';
                const departement = ligne['Département'] || ligne['departement'] || '';
                const taux_horaire = parseFloat(ligne['Taux horaire'] || ligne['taux_horaire'] || 0);
                const heures_contractuelles = parseInt(ligne['Heures contractuelles'] || ligne['heures_contractuelles'] || 0);
                const mot_de_passe = ligne['Mot de passe'] || ligne['mot_de_passe'] || 'password123';

                if (!nom || !prenom || !email) { erreurs++; continue; }

                const hash = await bcrypt.hash(mot_de_passe, 10);

                await new Promise((resolve, reject) => {
                    db.query(
                        'INSERT INTO utilisateurs (nom, prenom, email, mot_de_passe, mot_de_passe_affichage, role) VALUES (?, ?, ?, ?, ?, ?)',
                        [nom, prenom, email, hash, mot_de_passe, 'enseignant'],
                        (err, result) => {
                            if (err) { erreurs++; resolve(); return; }

                            db.query(
                                'INSERT INTO enseignants (utilisateur_id, grade, statut, departement, taux_horaire, heures_contractuelles) VALUES (?, ?, ?, ?, ?, ?)',
                                [result.insertId, grade, statut, departement, taux_horaire, heures_contractuelles],
                                (err2) => {
                                    if (err2) erreurs++;
                                    else succes++;
                                    resolve();
                                }
                            );
                        }
                    );
                });
            } catch (e) {
                erreurs++;
            }
        }

        fs.unlinkSync(req.file.path);
        res.json({ message: `Import terminé : ${succes} succès, ${erreurs} erreurs` });

    } catch (erreur) {
        console.error('Erreur import :', erreur);
        res.status(500).json({ message: 'Erreur lors de l\'import' });
    }
};