const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const enseignantsRoutes = require('./routes/enseignantsRoutes');
const statistiquesRoutes = require('./routes/statistiquesRoutes');
const matieresRoutes = require('./routes/matieresRoutes');
const heuresRoutes = require('./routes/heuresRoutes');
const exportsRoutes = require('./routes/exportsRoutes');
const parametresRoutes = require('./routes/parametresRoutes');
const utilisateursRoutes = require('./routes/utilisateursRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/enseignants', enseignantsRoutes);
app.use('/api/statistiques', statistiquesRoutes);
app.use('/api/matieres', matieresRoutes);
app.use('/api/heures', heuresRoutes);
app.use('/api/exports', exportsRoutes);
app.use('/api/parametres', parametresRoutes);
app.use('/api/utilisateurs', utilisateursRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});