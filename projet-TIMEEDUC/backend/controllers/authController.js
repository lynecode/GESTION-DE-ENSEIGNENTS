const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.login = (req, res) => {
    const { email, mot_de_passe } = req.body;

    db.query('SELECT * FROM utilisateurs WHERE email = ?', [email], async (err, results) => {
        if (err) return res.status(500).json({ message: 'Erreur serveur' });
        if (results.length === 0) return res.status(401).json({ message: 'Email incorrect' });

        const utilisateur = results[0];
        const valide = await bcrypt.compare(mot_de_passe, utilisateur.mot_de_passe);

        if (!valide) return res.status(401).json({ message: 'Mot de passe incorrect' });

        const token = jwt.sign(
            { id: utilisateur.id, role: utilisateur.role },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        // Si c'est un enseignant, on récupère son enseignant_id
        if (utilisateur.role === 'enseignant') {
            db.query('SELECT id FROM enseignants WHERE utilisateur_id = ?', [utilisateur.id], (err2, ens) => {
                if (err2 || ens.length === 0) return res.status(500).json({ message: 'Enseignant introuvable' });

                res.json({
                    token,
                    role: utilisateur.role,
                    nom: utilisateur.nom,
                    enseignantId: ens[0].id
                });
            });
        } else {
            res.json({
                token,
                role: utilisateur.role,
                nom: utilisateur.nom
            });
        }
    });
};