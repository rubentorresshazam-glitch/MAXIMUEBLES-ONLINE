const db = require('../config/database');

class Pedido {
  // ✅ Crear nuevo pedido
  static async crear(datos) {
    const { nombre, correo, telefono, direccion, productos, total, notas = '' } = datos;
    const res = await db.query(
      `INSERT INTO pedidos (nombre, correo, telefono, direccion, productos, total, notas, estado, fecha) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'pendiente', NOW()) RETURNING id`,
      [nombre, correo, telefono || null, direccion || '', JSON.stringify(productos), total, notas]
    );
    return res.rows[0].id;
  }

  // ✅ Listar todos los pedidos (más recientes primero)
  static async listarTodos() {
    const res = await db.query(
      `SELECT id, nombre, correo, telefono, direccion, total, estado, fecha 
       FROM pedidos ORDER BY id DESC`
    );
    return res.rows;
  }

  // ✅ Obtener un pedido por ID
  static async obtenerPorId(id) {
    const res = await db.query(
      `SELECT *, productos::text FROM pedidos WHERE id = $1`,
      [id]
    );
    if (res.rows.length === 0) return null;
    // ✅ Convertir JSON a objeto
    return {
      ...res.rows[0],
      productos: JSON.parse(res.rows[0].productos)
    };
  }

  // ✅ Obtener pedido con detalle (igual formato que antes)
  static async obtenerConDetalle(id) {
    const pedido = await this.obtenerPorId(id);
    if (!pedido) return null;
    return { pedido };
  }
}

module.exports = Pedido;