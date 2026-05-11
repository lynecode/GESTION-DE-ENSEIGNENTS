const db = require('../config/db');
const bcrypt = require('bcryptjs');

exports.getUtilisateurs = (req, res) => {
    db.query(
        'SELECT id, nom, prenom, email, role, mot_de_passe_affichage, created_at FROM utilisateurs ORDER BY created_at DESC',
        (err, results) => {
            if (err) return res.status(500).json({ message: 'Erreur serveur' });
            res.json(results);
        }
    );
};

exports.creerUtilisateur = async (req, res) => {
    const { nom, prenom, email, mot_de_passe, role } = req.body;
    const hash = await bcrypt.hash(mot_de_passe, 10);

    db.query(
        'INSERT INTO utilisateurs (nom, prenom, email, mot_de_passe, mot_de_passe_affichage, role) VALUES (?, ?, ?, ?, ?, ?)',
        [nom, prenom, email, hash, mot_de_passe, role],
        (err) => {
            if (err) return res.status(500).json({ message: 'Erreur création utilisateur' });
            res.json({ message: 'Utilisateur créé avec succès' });
        }
    );
};

exports.supprimerUtilisateur = (req, res) => {
    const { id } = req.params;

    db.query('SELECT role FROM utilisateurs WHERE id = ?', [id], (err, results) => {
        if (err || results.length === 0) return res.status(404).json({ message: 'Utilisateur introuvable' });

        if (results[0].role === 'admin') {
            return res.status(403).json({ message: 'Impossible de supprimer un administrateur' });
        }

        if (results[0].role === 'enseignant') {
            db.query('DELETE FROM enseignants WHERE utilisateur_id = ?', [id], (err2) => {
                if (err2) return res.status(500).json({ message: 'Erreur suppression enseignant' });
                db.query('DELETE FROM utilisateurs WHERE id = ?', [id], (err3) => {
                    if (err3) return res.status(500).json({ message: 'Erreur suppression utilisateur' });
                    res.json({ message: 'Enseignant supprimé avec succès' });
                });
            });
        } else {
            db.query('DELETE FROM utilisateurs WHERE id = ?', [id], (err2) => {
                if (err2) return res.status(500).json({ message: 'Erreur suppression' });
                res.json({ message: 'Utilisateur supprimé avec succès' });
            });
        }
    });
};

exports.modifierMotDePasse = async (req, res) => {
    const { id } = req.params;
    const { mot_de_passe } = req.body;
    const hash = await bcrypt.hash(mot_de_passe, 10);

    db.query(
        'UPDATE utilisateurs SET mot_de_passe = ?, mot_de_passe_affichage = ? WHERE id = ?',
        [hash, mot_de_passe, id],
        (err) => {
            if (err) return res.status(500).json({ message: 'Erreur modification' });
            res.json({ message: 'Mot de passe modifié avec succès' });
        }
    );
};