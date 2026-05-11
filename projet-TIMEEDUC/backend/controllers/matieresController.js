const db = require('../config/db');

exports.getMatieres = (req, res) => {
    db.query('SELECT * FROM matieres ORDER BY intitule ASC', (err, results) => {
        if (err) return res.status(500).json({ message: 'Erreur serveur' });
        res.json(results);
    });
};

exports.ajouterMatiere = (req, res) => {
    const { intitule, filiere, niveau, volume_horaire_prevu } = req.body;

    db.query(
        'INSERT INTO matieres (intitule, filiere, niveau, volume_horaire_prevu) VALUES (?, ?, ?, ?)',
        [intitule, filiere, niveau, volume_horaire_prevu],
        (err, result) => {
            if (err) return res.status(500).json({ message: 'Erreur création matière' });
            res.json({ message: 'Matière ajoutée avec succès' });
        }
    );
};

exports.modifierMatiere = (req, res) => {
    const { id } = req.params;
    const { intitule, filiere, niveau, volume_horaire_prevu } = req.body;

    db.query(
        'UPDATE matieres SET intitule=?, filiere=?, niveau=?, volume_horaire_prevu=? WHERE id=?',
        [intitule, filiere, niveau, volume_horaire_prevu, id],
        (err) => {
            if (err) return res.status(500).json({ message: 'Erreur modification' });
            res.json({ message: 'Matière modifiée avec succès' });
        }
    );
};

exports.supprimerMatiere = (req, res) => {
    const { id } = req.params;

    db.query('DELETE FROM matieres WHERE id = ?', [id], (err) => {
        if (err) return res.status(500).json({ message: 'Erreur suppression' });
        res.json({ message: 'Matière supprimée avec succès' });
    });
};