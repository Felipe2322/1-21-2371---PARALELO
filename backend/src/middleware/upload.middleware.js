/**
 * Middleware de subida de archivos.
 * - En Lambda (NODE_ENV=production + S3_BUCKET definido): usa multer-s3 → S3.
 * - En desarrollo local: usa multer diskStorage → carpeta local /uploads.
 */
const multer  = require('multer');
const path    = require('path');
const { v4: uuidv4 } = require('uuid');
const fs      = require('fs');

const allowedMimes = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const fileFilter = (_req, file, cb) => {
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Tipo de archivo no permitido: ${file.mimetype}`), false);
  }
};

let storage;

if (process.env.S3_BUCKET) {
  // ---------- S3 storage (Lambda / producción) ----------
  const { S3Client } = require('@aws-sdk/client-s3');
  const multerS3    = require('multer-s3');

  const s3 = new S3Client({ region: process.env.AWS_REGION || 'us-east-1' });

  storage = multerS3({
    s3,
    bucket: process.env.S3_BUCKET,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (_req, file, cb) => {
      const uniqueName = `uploads/${uuidv4()}${path.extname(file.originalname)}`;
      cb(null, uniqueName);
    },
  });
} else {
  // ---------- Disk storage (desarrollo local) ----------
  const uploadDir = path.join(__dirname, '..', '..', process.env.UPLOAD_DIR || 'uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename:    (_req, file, cb) => {
      cb(null, `${uuidv4()}${path.extname(file.originalname)}`);
    },
  });
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

module.exports = upload;
