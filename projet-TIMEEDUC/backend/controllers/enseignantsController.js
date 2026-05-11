const db = require('../config/db');
const bcrypt = require('bcryptjs');

exports.getEnseignants = (req, res) => {
    db.query(`
        SELECT e.id, e.grade, e.statut, e.departement, e.taux_horaire, e.heures_contractuelles,
               u.nom, u.prenom, u.email
        FROM enseignants e 
        JOIN utilisateurs u ON e.utilisateur_id = u.id
        ORDER BY u.nom ASC
    `, (err, results) => {
        if (err) return res.status(500).json({ message: 'Erreur serveur' });
        res.json(results);
    });
};

exports.getEnseignantsRecents = (req, res) => {
    db.query(`
        SELECT e.id, e.grade, e.statut, e.departement, e.taux_horaire, e.heures_contractuelles,
               u.nom, u.prenom, u.email
        FROM enseignants e 
        JOIN utilisateurs u ON e.utilisateur_id = u.id
        ORDER BY e.id DESC LIMIT 5
    `, (err, results) => {
        if (err) return res.status(500).json({ message: 'Erreur serveur' });
        res.json(results);
    });
};

exports.ajouterEnseignant = async (req, res) => {
    const { nom, prenom, email, grade, statut, departement, taux_horaire, heures_contractuelles } = req.body;
    const mot_de_passe = await bcrypt.hash('password123', 10);

    db.query('SELECT id FROM utilisateurs WHERE email = ?', [email], (err, existe) => {
        if (err) return res.status(500).json({ message: 'Erreur serveur' });
        if (existe.length > 0) return res.status(400).json({ message: 'Cet email est déjà utilisé' });

        db.query(
            'INSERT INTO utilisateurs (nom, prenom, email, mot_de_passe, role) VALUES (?, ?, ?, ?, ?)',
            [nom, prenom, email, mot_de_passe, 'enseignant'],
            (err, result) => {
                if (err) return res.status(500).json({ message: 'Erreur création utilisateur' });

                const utilisateur_id = result.insertId;
                db.query(
                    'INSERT INTO enseignants (utilisateur_id, grade, statut, departement, taux_horaire, heures_contractuelles) VALUES (?, ?, ?, ?, ?, ?)',
                    [utilisateur_id, grade, statut, departement, taux_horaire, heures_contractuelles || 0],
                    (err2) => {
                        if (err2) return res.status(500).json({ message: 'Erreur création enseignant' });
                        res.json({ message: 'Enseignant ajouté avec succès' });
                    }
                );
            }
        );
    });
};
exports.modifierEnseignant = (req, res) => {
    const { id } = req.params;
    const { nom, prenom, email, grade, statut, departement, taux_horaire } = req.body;

    db.query(
        `UPDATE utilisateurs u 
         JOIN enseignants e ON u.id = e.utilisateur_id 
         SET u.nom=?, u.prenom=?, u.email=?, e.grade=?, e.statut=?, e.departement=?, e.taux_horaire=? 
         WHERE e.id=?`,
        [nom, prenom, email, grade, statut, departement, taux_horaire, id],
        (err) => {
            if (err) return res.status(500).json({ message: 'Erreur modification' });
            res.json({ message: 'Enseignant modifié avec succès' });
        }
    );
};

exports.supprimerEnseignant = (req, res) => {
    const { id } = req.params;

    db.query('SELECT utilisateur_id FROM enseignants WHERE id = ?', [id], (err, results) => {
        if (err || results.length === 0) return res.status(404).json({ message: 'Enseignant introuvable' });

        const utilisateur_id = results[0].utilisateur_id;

        db.query('DELETE FROM enseignants WHERE id = ?', [id], (err2) => {
            if (err2) return res.status(500).json({ message: 'Erreur suppression' });

            db.query('DELETE FROM utilisateurs WHERE id = ?', [utilisateur_id], (err3) => {
                if (err3) return res.status(500).json({ message: 'Erreur suppression utilisateur' });
                res.json({ message: 'Enseignant supprimé avec succès' });
            });
        });
    });
};