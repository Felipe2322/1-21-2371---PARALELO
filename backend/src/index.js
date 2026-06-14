require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { sequelize } = require('./config/database');

const authRoutes         = require('./routes/auth.routes');
const userRoutes         = require('./routes/user.routes');
const uploadRoutes       = require('./routes/upload.routes');
const profileRoutes      = require('./routes/profile.routes');
const configRoutes       = require('./routes/config.routes');
const notificationRoutes = require('./routes/notification.routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '8mb' }));
app.use(express.urlencoded({ extended: true, limit: '8mb' }));

app.use('/uploads', express.static(path.join(__dirname, '..', process.env.UPLOAD_DIR || 'uploads')));

app.use('/api/auth',          authRoutes);
app.use('/api/users',         userRoutes);
app.use('/api/upload',        uploadRoutes);
app.use('/upload',            uploadRoutes);
app.use('/api/profile',       profileRoutes);
app.use('/api/config',        configRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida.');
    await sequelize.sync({ force: false, alter: false });
    console.log('✅ Modelos sincronizados con la base de datos.');
    app.listen(PORT, '0.0.0.0', () => {
      console.log(` Servidor corriendo en http://0.0.0.0:${PORT}`);
    });
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

startServer();
