const express = require('express');
const router = express.Router();
const parametresController = require('../controllers/parametresController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/', authMiddleware, parametresController.getParametres);
router.post('/', authMiddleware, parametresController.sauvegarderParametres);

module.exports = router;