// GET /api/config - Configuración de la aplicación (para consumo paralelo)
const getConfig = async (req, res) => {
  try {
    const config = {
      appName: 'API Felix Cabrera',
      version: '1.0.0',
      features: {
        fileUpload: true,
        userManagement: true,
        roles: ['admin', 'user'],
        maxFileSize: '10MB',
        allowedFileTypes: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
      },
      pagination: {
        defaultLimit: 10,
        maxLimit: 100,
      },
      maintenance: false,
      lastUpdated: new Date().toISOString(),
    };

    res.json({
      success: true,
      data: { config },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getConfig };
