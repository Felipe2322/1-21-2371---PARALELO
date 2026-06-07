const express = require('express');
const router = express.Router();
const { uploadFile, getFiles, deleteFile } = require('../controllers/upload.controller');
const { authenticate } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

router.use(authenticate);

// POST /api/upload - Subir archivo
router.post('/', upload.single('file'), uploadFile);

// GET /api/upload - Listar archivos del usuario
router.get('/', getFiles);

// DELETE /api/upload/:id - Eliminar archivo
router.delete('/:id', deleteFile);

module.exports = router;
