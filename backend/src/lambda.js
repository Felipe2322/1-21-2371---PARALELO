/**
 * Lambda handler entry point.
 * Wraps the existing Express app using @vendia/serverless-express.
 * Se carga UNA vez por contenedor (warm start) para reutilizar la
 * conexión a la base de datos.
 */
require('dotenv').config();
const serverlessExpress = require('@vendia/serverless-express');
const express = require('express');
const cors = require('cors');
const path = require('path');
const { sequelize } = require('./config/database');

const authRoutes    = require('./routes/auth.routes');
const userRoutes    = require('./routes/user.routes');
const uploadRoutes  = require('./routes/upload.routes');
const profileRoutes = require('./routes/profile.routes');
const configRoutes  = require('./routes/config.routes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// En Lambda los archivos se sirven desde S3; el static local solo queda
// como fallback para desarrollo.
app.use('/uploads', express.static(path.join(__dirname, '..', process.env.UPLOAD_DIR || 'uploads')));

app.use('/api/auth',    authRoutes);
app.use('/api/users',   userRoutes);
app.use('/api/upload',  uploadRoutes);
app.use('/upload',      uploadRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/config',  configRoutes);

app.get('/health', (_req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handler
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Promesa de inicialización DB (se resuelve una sola vez por contenedor).
let dbReady = null;

const initDb = () => {
  if (!dbReady) {
    dbReady = sequelize
      .authenticate()
      .then(() => sequelize.sync({ force: false, alter: false }))
      .then(() => console.log('✅ DB sincronizada.'))
      .catch((err) => {
        console.error('Error DB:', err);
        dbReady = null; // permitir reintento en la próxima invocación
        throw err;
      });
  }
  return dbReady;
};

// Handler exportado para Lambda
let serverlessHandler;

exports.handler = async (event, context) => {
  // Reutilizar conexión DB entre invocaciones warm
  context.callbackWaitsForEmptyEventLoop = false;

  await initDb();

  if (!serverlessHandler) {
    serverlessHandler = serverlessExpress({ app });
  }

  return serverlessHandler(event, context);
};
