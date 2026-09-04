const { Pool } = require('pg');

const conexion = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USUARIO,
  password: process.env.DB_CONTRASENA,
  database: process.env.DB_NOMBRE,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 60000
});

conexion.on('error', (err) => {
  console.log('⚠️ Error conexión Neon:', err.message);
});

module.exports = conexion;