const express = require('express');
const router = express.Router();
const heuresController = require('../controllers/heuresController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/', authMiddleware, heuresController.getHeures);
router.get('/enseignant/:id', authMiddleware, heuresController.getHeuresParEnseignant);
router.get('/recapitulatif/:id', authMiddleware, heuresController.getRecapitulatifEnseignant);
router.post('/', authMiddleware, heuresController.ajouterHeure);
router.put('/:id', authMiddleware, heuresController.modifierHeure);
router.delete('/:id', authMiddleware, heuresController.supprimerHeure);

module.exports = router;