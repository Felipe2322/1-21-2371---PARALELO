const path = require('path');
const FileUpload = require('../models/FileUpload');

/**
 * Devuelve la URL pública de un archivo subido.
 * - S3: req.file.location (provisto por multer-s3)
 * - Local: construye URL a partir del hostname del request
 */
const resolveFileUrl = (req) => {
  if (req.file.location) {
    // multer-s3 populate .location con la URL pública de S3
    return req.file.location;
  }
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  return `${baseUrl}/uploads/${req.file.filename}`;
};

// POST /api/upload
const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No se proporcionó ningún archivo',
      });
    }

    const originalname = req.file.originalname;
    const filename     = req.file.key || req.file.filename; // S3 usa .key
    const mimetype     = req.file.mimetype || req.file.contentType;
    const size         = req.file.size;
    const fileUrl      = resolveFileUrl(req);

    const fileRecord = await FileUpload.create({
      originalName: originalname,
      filename,
      mimetype,
      size,
      url: fileUrl,
      uploadedBy: req.user ? req.user.id : null,
    });

    res.status(201).json({
      success: true,
      message: 'Archivo subido exitosamente',
      data: {
        id:           fileRecord.id,
        originalName: fileRecord.originalName,
        filename:     fileRecord.filename,
        mimetype:     fileRecord.mimetype,
        size:         fileRecord.size,
        url:          fileRecord.url,
        uploadedAt:   fileRecord.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/upload - Listar archivos del usuario
const getFiles = async (req, res) => {
  try {
    const where = req.user ? { uploadedBy: req.user.id } : {};
    const files = await FileUpload.findAll({
      where,
      order: [['createdAt', 'DESC']],
    });

    res.json({ success: true, data: { files } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/upload/:id
const deleteFile = async (req, res) => {
  try {
    const file = await FileUpload.findByPk(req.params.id);
    if (!file) {
      return res.status(404).json({ success: false, message: 'Archivo no encontrado' });
    }

    if (process.env.S3_BUCKET) {
      // Eliminar objeto de S3
      const { S3Client, DeleteObjectCommand } = require('@aws-sdk/client-s3');
      const s3 = new S3Client({ region: process.env.AWS_REGION || 'us-east-1' });
      await s3.send(new DeleteObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key:    file.filename,
      }));
    } else {
      // Eliminar archivo local
      const fs       = require('fs');
      const filePath = path.join(
        __dirname, '..', '..', process.env.UPLOAD_DIR || 'uploads', file.filename
      );
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await file.destroy();
    res.json({ success: true, message: 'Archivo eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { uploadFile, getFiles, deleteFile };
