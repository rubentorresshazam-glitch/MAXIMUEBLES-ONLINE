const db = require('../config/database');

class Contacto {
  // ✅ Guardar mensaje de contacto
  static async guardar(datos) {
    const { nombre, correo, telefono, asunto, mensaje } = datos;
    const res = await db.query(
      `INSERT INTO mensajes_contacto (nombre, correo, telefono, asunto, mensaje, fecha) 
       VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING id`,
      [nombre, correo, telefono || null, asunto, mensaje]
    );
    return res.rows[0].id;
  }
}

module.exports = Contacto;