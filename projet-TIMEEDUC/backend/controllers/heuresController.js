const db = require('../config/db');

exports.getHeures = (req, res) => {
    db.query(`
        SELECT h.*, 
               u.nom, u.prenom,
               e.heures_contractuelles,
               m.intitule as matiere
        FROM heures_effectuees h
        JOIN enseignants e ON h.enseignant_id = e.id
        JOIN utilisateurs u ON e.utilisateur_id = u.id
        JOIN matieres m ON h.matiere_id = m.id
        ORDER BY h.date_cours DESC
    `, (err, results) => {
        if (err) return res.status(500).json({ message: 'Erreur serveur' });
        res.json(results);
    });
};

exports.ajouterHeure = (req, res) => {
    const { enseignant_id, matiere_id, date_cours, type_heure, duree, salle, observations } = req.body;

    db.query(
        'INSERT INTO heures_effectuees (enseignant_id, matiere_id, date_cours, type_heure, duree, salle, observations) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [enseignant_id, matiere_id, date_cours, type_heure, duree, salle, observations],
        (err) => {
            if (err) return res.status(500).json({ message: 'Erreur ajout heure' });
            res.json({ message: 'Heure ajoutée avec succès' });
        }
    );
};

exports.modifierHeure = (req, res) => {
    const { id } = req.params;
    const { enseignant_id, matiere_id, date_cours, type_heure, duree, salle, observations } = req.body;

    db.query(
        'UPDATE heures_effectuees SET enseignant_id=?, matiere_id=?, date_cours=?, type_heure=?, duree=?, salle=?, observations=? WHERE id=?',
        [enseignant_id, matiere_id, date_cours, type_heure, duree, salle, observations, id],
        (err) => {
            if (err) return res.status(500).json({ message: 'Erreur modification' });
            res.json({ message: 'Heure modifiée avec succès' });
        }
    );
};

exports.supprimerHeure = (req, res) => {
    const { id } = req.params;

    db.query('DELETE FROM heures_effectuees WHERE id = ?', [id], (err) => {
        if (err) return res.status(500).json({ message: 'Erreur suppression' });
        res.json({ message: 'Heure supprimée avec succès' });
    });
};

exports.getHeuresParEnseignant = (req, res) => {
    const { id } = req.params;

    db.query(`
        SELECT h.*, m.intitule as matiere
        FROM heures_effectuees h
        JOIN matieres m ON h.matiere_id = m.id
        WHERE h.enseignant_id = ?
        ORDER BY h.date_cours DESC
    `, [id], (err, results) => {
        if (err) return res.status(500).json({ message: 'Erreur serveur' });
        res.json(results);
    });
};

exports.getRecapitulatifEnseignant = (req, res) => {
    const { id } = req.params;

    db.query(`
        SELECT 
            u.nom, u.prenom, e.grade, e.statut, e.departement, e.taux_horaire, e.heures_contractuelles,
            COALESCE(SUM(h.duree), 0) as total_heures,
            COALESCE(SUM(CASE WHEN h.type_heure = 'CM' THEN h.duree ELSE 0 END), 0) as total_cm,
            COALESCE(SUM(CASE WHEN h.type_heure = 'TD' THEN h.duree ELSE 0 END), 0) as total_td,
            COALESCE(SUM(CASE WHEN h.type_heure = 'TP' THEN h.duree ELSE 0 END), 0) as total_tp
        FROM enseignants e
        JOIN utilisateurs u ON e.utilisateur_id = u.id
        LEFT JOIN heures_effectuees h ON h.enseignant_id = e.id
        WHERE e.id = ?
        GROUP BY e.id
    `, [id], (err, results) => {
        if (err) return res.status(500).json({ message: 'Erreur serveur' });
        if (results.length === 0) return res.status(404).json({ message: 'Enseignant introuvable' });

        const data = results[0];
        const heures_normales = Math.min(data.total_heures, data.heures_contractuelles);
        const heures_complementaires = Math.max(0, data.total_heures - data.heures_contractuelles);
        const montant_total = (heures_normales + heures_complementaires) * data.taux_horaire;

        res.json({ ...data, heures_normales, heures_complementaires, montant_total });
    });
};