const db = require('../config/database');
class Pedido {
  // ✅ Crear nuevo pedido — CON datos de facturación
  static async crear(datos) {
    const { 
      nombre, correo, telefono, direccion, productos, total, notas = '', sesion_id = 'invitado',
      quiero_factura, dni_comprador, domicilio_comprador // ✅ CAMPOS NUEVOS
    } = datos;
    const res = await db.query(
      `INSERT INTO pedidos 
       (nombre, correo, telefono, direccion, productos, total, notas, estado, sesion_id, fecha,
        quiero_factura, dni_comprador, domicilio_comprador) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'pendiente', $8, NOW(), $9, $10, $11) 
       RETURNING id`,
      [
        nombre, correo, telefono || null, direccion || '', JSON.stringify(productos), total, notas, sesion_id,
        quiero_factura || false, dni_comprador || null, domicilio_comprador || null
      ]
    );
    return res.rows[0].id;
  }

  // ✅ Actualizar número de factura cuando se genera
  static async actualizarFactura(pedido_id, numeroFactura) {
    await db.query(
      `UPDATE pedidos 
       SET factura_generada = true, factura_numero = $1, fecha_factura = NOW() 
       WHERE id = $2`,
      [numeroFactura, pedido_id]
    );
  }

  // ✅ Listar TODOS los pedidos (Panel administrativo)
  static async listarTodos() {
    const res = await db.query(
      `SELECT id, nombre, correo, telefono, direccion, total, estado, sesion_id, fecha,
              quiero_factura, factura_generada, factura_numero 
       FROM pedidos ORDER BY id DESC`
    );
    return res.rows;
  }

  // ✅ Obtener pedidos DE UN CLIENTE por sesion_id
  static async obtenerPorSesion(sesion_id) {
    const res = await db.query(
      `SELECT *, productos::text FROM pedidos WHERE sesion_id = $1 ORDER BY id DESC`,
      [sesion_id]
    );
    return res.rows.map(pedido => ({
      ...pedido,
      productos: JSON.parse(pedido.productos)
    }));
  }

  // ✅ Obtener UN pedido por ID
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

  // ✅ Obtener pedido con detalle
  static async obtenerConDetalle(id) {
    const pedido = await this.obtenerPorId(id);
    if (!pedido) return null;
    return { pedido };
  }
}

module.exports = Pedido;