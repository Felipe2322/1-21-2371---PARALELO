const { Sequelize } = require('sequelize');

let sequelize;

// Si DATABASE_URL está definida (Neon / Supabase / RDS), usarla directamente.
// De lo contrario, construir la conexión desde las variables individuales.
if (process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      // Requerido para Neon / Supabase (conexión SSL)
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
    pool: {
      // Lambda puede crear muchas conexiones simultáneas.
      // Mantener el pool pequeño para no saturar la DB.
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  });
} else {
  sequelize = new Sequelize(
    process.env.DB_NAME     || 'appdb',
    process.env.DB_USER     || 'appuser',
    process.env.DB_PASSWORD || 'apppassword',
    {
      host:    process.env.DB_HOST || 'localhost',
      port:    parseInt(process.env.DB_PORT) || 5432,
      dialect: 'postgres',
      logging: false,
      pool: {
        max:     5,
        min:     0,
        acquire: 30000,
        idle:    10000,
      },
    }
  );
}

module.exports = { sequelize };
