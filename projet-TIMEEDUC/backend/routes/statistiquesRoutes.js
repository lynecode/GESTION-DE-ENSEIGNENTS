const express = require('express');
const router = express.Router();
const statistiquesController = require('../controllers/statistiquesController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/tableau-de-bord', authMiddleware, statistiquesController.getTableauDeBord);
router.get('/annee-academique', authMiddleware, statistiquesController.getAnneeAcademique);

module.exports = router;