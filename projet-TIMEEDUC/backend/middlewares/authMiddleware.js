const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) return res.status(401).json({ message: 'Token manquant' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.utilisateur = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Token invalide' });
    }
};