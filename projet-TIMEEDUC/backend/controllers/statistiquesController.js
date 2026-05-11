const db = require('../config/db');

exports.getTableauDeBord = (req, res) => {
    const requetes = {
        totalEnseignants: 'SELECT COUNT(*) as total FROM enseignants',
        totalMatieres: 'SELECT COUNT(*) as total FROM matieres',
        totalHeures: 'SELECT COALESCE(SUM(duree), 0) as total FROM heures_effectuees',
        totalDepassements: `
            SELECT COUNT(*) as total FROM enseignants e
            WHERE (
                SELECT COALESCE(SUM(h.duree), 0) 
                FROM heures_effectuees h 
                WHERE h.enseignant_id = e.id
            ) > e.heures_contractuelles
            AND e.heures_contractuelles > 0
        `
    };

    const resultats = {};

    db.query(requetes.totalEnseignants, (err, r1) => {
        if (err) return res.status(500).json({ message: 'Erreur serveur' });
        resultats.totalEnseignants = r1[0].total;

        db.query(requetes.totalMatieres, (err, r2) => {
            if (err) return res.status(500).json({ message: 'Erreur serveur' });
            resultats.totalMatieres = r2[0].total;

            db.query(requetes.totalHeures, (err, r3) => {
                if (err) return res.status(500).json({ message: 'Erreur serveur' });
                resultats.totalHeures = r3[0].total;

                db.query(requetes.totalDepassements, (err, r4) => {
                    if (err) return res.status(500).json({ message: 'Erreur serveur' });
                    resultats.totalDepassements = r4[0].total;

                    res.json(resultats);
                });
            });
        });
    });
};

exports.getAnneeAcademique = (req, res) => {
    db.query('SELECT annee_academique FROM parametres ORDER BY id DESC LIMIT 1', (err, results) => {
        if (err) return res.status(500).json({ message: 'Erreur serveur' });
        if (results.length === 0) return res.json({ annee_academique: 'Non définie' });
        res.json({ annee_academique: results[0].annee_academique || 'Non définie' });
    });
};