const express = require('express');
const router = express.Router();
const enseignantsController = require('../controllers/enseignantsController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/', authMiddleware, enseignantsController.getEnseignants);
router.get('/recents', authMiddleware, enseignantsController.getEnseignantsRecents);
router.post('/', authMiddleware, enseignantsController.ajouterEnseignant);
router.put('/:id', authMiddleware, enseignantsController.modifierEnseignant);
router.delete('/:id', authMiddleware, enseignantsController.supprimerEnseignant);

module.exports = router;