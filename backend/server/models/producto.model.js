const db = require('../config/database');

class Producto {
  // ✅ Obtener todos los productos (más recientes primero)
  static async obtenerTodos() {
    const res = await db.query('SELECT * FROM productos ORDER BY id DESC');
    return res.rows;
  }

  // ✅ Obtener productos filtrados por categoría
  static async obtenerPorCategoria(categoria) {
    const res = await db.query(
      'SELECT * FROM productos WHERE LOWER(categoria) = LOWER($1) ORDER BY id DESC',
      [categoria]
    );
    return res.rows;
  }

  // ✅ Obtener un producto por ID
  static async obtenerPorId(id) {
    const res = await db.query('SELECT * FROM productos WHERE id = $1', [id]);
    return res.rows[0] || null;
  }

  // ✅ Crear nuevo producto
  static async crear(datos) {
    const { nombre, descripcion, precio, stock, categoria, imagenes } = datos;
    const res = await db.query(
      `INSERT INTO productos (nombre, descripcion, precio, stock, categoria, imagenes)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [nombre.trim(), descripcion || '', precio, stock, categoria || '', imagenes || '']
    );
    return res.rows[0].id;
  }

  // ✅ Actualizar producto
  static async actualizar(id, datos) {
    const { nombre, descripcion, precio, stock, categoria, imagenes } = datos;
    await db.query(
      `UPDATE productos 
       SET nombre = $1, descripcion = $2, precio = $3, stock = $4, categoria = $5, imagenes = $6
       WHERE id = $7`,
      [nombre, descripcion, precio, stock, categoria, imagenes, id]
    );
    return true;
  }

  // ✅ Eliminar producto
  static async eliminar(id) {
    await db.query('DELETE FROM productos WHERE id = $1', [id]);
    return true;
  }
}

module.exports = Producto;