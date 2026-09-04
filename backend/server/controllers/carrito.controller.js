const db = require('../config/database');

// ✅ VER CARRITO — Solo de la sesión actual
const verCarrito = async (req, res) => {
  try {
    const sesion_id = req.query.sesion_id || 'invitado';
    if (!sesion_id) {
      return res.status(400).json({ ok: false, mensaje: 'Falta el identificador de sesión' });
    }

    const [carrito] = await db.query(`
      SELECT c.id, c.producto_id, p.nombre, p.precio, c.cantidad, 
             (p.precio * c.cantidad) AS subtotal
      FROM carrito c
      JOIN productos p ON c.producto_id = p.id
      WHERE c.sesion_id = $1
    `, [sesion_id]);

    res.json({ ok: true, datos: carrito });
  } catch (error) {
    console.error('❌ Error al ver carrito:', error.message);
    res.status(500).json({ ok: false, mensaje: 'Error al cargar el carrito' });
  }
};

// ✅ AGREGAR PRODUCTO — Si ya existe suma cantidad
const agregar = async (req, res) => {
  try {
    const { sesion_id = 'invitado', producto_id, cantidad = 1 } = req.body;

    if (!sesion_id || !producto_id) {
      return res.status(400).json({ ok: false, mensaje: 'Faltan datos' });
    }

    // Verificar si ya está en el carrito
    const [existe] = await db.query(
      'SELECT id, cantidad FROM carrito WHERE sesion_id = $1 AND producto_id = $2',
      [sesion_id, producto_id]
    );

    if (existe.length > 0) {
      const nuevaCant = existe[0].cantidad + Number(cantidad);
      await db.query(
        'UPDATE carrito SET cantidad = $1 WHERE id = $2',
        [nuevaCant, existe[0].id]
      );
      return res.json({ ok: true, mensaje: '✅ Cantidad actualizada' });
    }

    // Si no existe → agregarlo nuevo
    await db.query(
      'INSERT INTO carrito (sesion_id, producto_id, cantidad) VALUES ($1, $2, $3)',
      [sesion_id, producto_id, cantidad]
    );
    res.json({ ok: true, mensaje: '✅ Producto agregado al carrito' });
  } catch (error) {
    console.error('❌ Error al agregar:', error.message);
    res.status(500).json({ ok: false, mensaje: 'Error al agregar producto' });
  }
};

// ✅ ACTUALIZAR CANTIDAD
const actualizar = async (req, res) => {
  try {
    const { id } = req.params;
    const { sesion_id = 'invitado', cantidad } = req.body;

    if (!sesion_id || !cantidad) {
      return res.status(400).json({ ok: false, mensaje: 'Faltan datos' });
    }

    const [result] = await db.query(
      'UPDATE carrito SET cantidad = $1 WHERE id = $2 AND sesion_id = $3',
      [cantidad, id, sesion_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ ok: false, mensaje: 'Producto no encontrado' });
    }

    res.json({ ok: true, mensaje: '✅ Cantidad actualizada' });
  } catch (error) {
    console.error('❌ Error al actualizar:', error.message);
    res.status(500).json({ ok: false, mensaje: 'Error al actualizar cantidad' });
  }
};

// ✅ ELIMINAR PRODUCTO
const eliminar = async (req, res) => {
  try {
    const { id } = req.params;
    const { sesion_id = 'invitado' } = req.query;

    if (!sesion_id) {
      return res.status(400).json({ ok: false, mensaje: 'Falta el identificador de sesión' });
    }

    const [result] = await db.query(
      'DELETE FROM carrito WHERE id = $1 AND sesion_id = $2',
      [id, sesion_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ ok: false, mensaje: 'Producto no encontrado' });
    }

    res.json({ ok: true, mensaje: '✅ Producto eliminado del carrito' });
  } catch (error) {
    console.error('❌ Error al eliminar:', error.message);
    res.status(500).json({ ok: false, mensaje: 'Error al eliminar producto' });
  }
};

// ✅ VACIAR CARRITO COMPLETO
const vaciar = async (req, res) => {
  try {
    const { sesion_id = 'invitado' } = req.query;

    if (!sesion_id) {
      return res.status(400).json({ ok: false, mensaje: 'Falta el identificador de sesión' });
    }

    await db.query('DELETE FROM carrito WHERE sesion_id = $1', [sesion_id]);
    res.json({ ok: true, mensaje: '✅ Carrito vaciado' });
  } catch (error) {
    console.error('❌ Error al vaciar:', error.message);
    res.status(500).json({ ok: false, mensaje: 'Error al vaciar carrito' });
  }
};

module.exports = { verCarrito, agregar, actualizar, eliminar, vaciar };