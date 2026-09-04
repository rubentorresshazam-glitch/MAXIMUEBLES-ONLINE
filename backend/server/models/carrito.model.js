const db = require('../config/database');

class Carrito {
  // ✅ Ver productos del carrito de una sesión
  static async ver(sesion_id) {
    const res = await db.query(`
      SELECT c.id, c.producto_id, p.nombre, p.precio, c.cantidad, 
             (p.precio * c.cantidad) AS subtotal
      FROM carrito c
      JOIN productos p ON c.producto_id = p.id
      WHERE c.sesion_id = $1
    `, [sesion_id]);
    return res.rows;
  }

  // ✅ Agregar o sumar cantidad si ya existe
  static async agregar(sesion_id, producto_id, cantidad) {
    const existe = await db.query(
      'SELECT id, cantidad FROM carrito WHERE sesion_id = $1 AND producto_id = $2',
      [sesion_id, producto_id]
    );

    if (existe.rows.length > 0) {
      // ✅ Ya existe → sumar cantidad
      await db.query(
        'UPDATE carrito SET cantidad = cantidad + $1 WHERE sesion_id = $2 AND producto_id = $3',
        [cantidad, sesion_id, producto_id]
      );
    } else {
      // ✅ No existe → insertar nuevo
      await db.query(
        'INSERT INTO carrito (sesion_id, producto_id, cantidad) VALUES ($1, $2, $3)',
        [sesion_id, producto_id, cantidad]
      );
    }
  }

  // ✅ Actualizar cantidad específica
  static async actualizar(sesion_id, id, cantidad) {
    const res = await db.query(
      'UPDATE carrito SET cantidad = $1 WHERE id = $2 AND sesion_id = $3',
      [cantidad, id, sesion_id]
    );
    return res.rowCount > 0;
  }

  // ✅ Eliminar un producto del carrito
  static async eliminar(sesion_id, id) {
    const res = await db.query(
      'DELETE FROM carrito WHERE id = $1 AND sesion_id = $2',
      [id, sesion_id]
    );
    return res.rowCount > 0;
  }

  // ✅ Vaciar todo el carrito
  static async vaciar(sesion_id) {
    await db.query('DELETE FROM carrito WHERE sesion_id = $1', [sesion_id]);
  }
}

module.exports = Carrito;