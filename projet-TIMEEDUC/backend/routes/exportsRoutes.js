const express = require('express');
const router = express.Router();
const exportsController = require('../controllers/exportsController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/excel', authMiddleware, exportsController.exporterExcel);
router.get('/pdf', authMiddleware, exportsController.exporterPDF);

module.exports = router;