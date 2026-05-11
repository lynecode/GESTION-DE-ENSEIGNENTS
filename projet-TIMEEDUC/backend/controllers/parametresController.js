const db = require('../config/db');

exports.getParametres = (req, res) => {
    db.query('SELECT * FROM parametres ORDER BY id DESC LIMIT 1', (err, results) => {
        if (err) return res.status(500).json({ message: 'Erreur serveur' });
        if (results.length === 0) return res.json({
            annee_academique: '',
            equivalence_cm: 1.5,
            equivalence_tp: 0.75
        });
        res.json(results[0]);
    });
};

exports.sauvegarderParametres = (req, res) => {
    const { annee_academique, equivalence_cm, equivalence_tp } = req.body;

    db.query('SELECT id FROM parametres LIMIT 1', (err, results) => {
        if (err) return res.status(500).json({ message: 'Erreur serveur' });

        if (results.length === 0) {
            db.query(
                'INSERT INTO parametres (annee_academique, equivalence_cm, equivalence_tp) VALUES (?, ?, ?)',
                [annee_academique, equivalence_cm, equivalence_tp],
                (err2) => {
                    if (err2) return res.status(500).json({ message: 'Erreur création paramètres' });
                    res.json({ message: 'Paramètres enregistrés avec succès' });
                }
            );
        } else {
            db.query(
                'UPDATE parametres SET annee_academique=?, equivalence_cm=?, equivalence_tp=? WHERE id=?',
                [annee_academique, equivalence_cm, equivalence_tp, results[0].id],
                (err2) => {
                    if (err2) return res.status(500).json({ message: 'Erreur modification paramètres' });
                    res.json({ message: 'Paramètres mis à jour avec succès' });
                }
            );
        }
    });
};