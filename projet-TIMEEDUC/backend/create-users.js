const bcrypt = require('bcryptjs');
const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

// Connexion
db.connect((err) => {
    if (err) throw err;
    console.log('Connecté à MySQL');
    createUsers();
});

function createUsers() {
    const hash = (pwd) => bcrypt.hashSync(pwd, 10);
    const users = [
        { nom: 'Durand', prenom: 'Sophie', email: 'rh@timeedu.com', mdp: hash('rh123'), role: 'rh' },
        { nom: 'Martin', prenom: 'Paul', email: 'ens@timeedu.com', mdp: hash('ens123'), role: 'enseignant' }
    ];

    users.forEach(user => {
        db.query(
            'INSERT INTO utilisateurs (nom, prenom, email, mot_de_passe, role) VALUES (?, ?, ?, ?, ?)',
            [user.nom, user.prenom, user.email, user.mdp, user.role],
            (err, result) => {
                if (err && err.code === 'ER_DUP_ENTRY') {
                    console.log(`⚠️ L'utilisateur ${user.email} existe déjà.`);
                } else if (err) {
                    console.error(err);
                } else {
                    console.log(`✅ Utilisateur créé : ${user.email} (${user.role})`);
                }
            }
        );
    });
}