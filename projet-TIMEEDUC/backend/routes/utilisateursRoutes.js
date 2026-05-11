const express = require('express');
const router = express.Router();
const utilisateursController = require('../controllers/utilisateursController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/', authMiddleware, utilisateursController.getUtilisateurs);
router.post('/', authMiddleware, utilisateursController.creerUtilisateur);
router.delete('/:id', authMiddleware, utilisateursController.supprimerUtilisateur);
router.put('/:id/mot-de-passe', authMiddleware, utilisateursController.modifierMotDePasse);

module.exports = router;