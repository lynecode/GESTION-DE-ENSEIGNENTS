const express = require('express');
const router = express.Router();
const matieresController = require('../controllers/matieresController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/', authMiddleware, matieresController.getMatieres);
router.post('/', authMiddleware, matieresController.ajouterMatiere);
router.put('/:id', authMiddleware, matieresController.modifierMatiere);
router.delete('/:id', authMiddleware, matieresController.supprimerMatiere);

module.exports = router;