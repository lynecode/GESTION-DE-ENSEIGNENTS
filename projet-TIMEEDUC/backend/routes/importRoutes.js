const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const importController = require('../controllers/importController');
const authMiddleware = require('../middlewares/authMiddleware');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

router.post('/enseignants', authMiddleware, upload.single('fichier'), importController.importerEnseignants);

module.exports = router;