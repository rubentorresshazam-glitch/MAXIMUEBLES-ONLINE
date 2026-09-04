const db = require('../config/database');
// ✅ Importamos la función de facturación y correo
const { enviarCorreoConFactura } = require('../config/afip-facturacion');

// ✅ Crear pedido como invitado — SIN cuenta de usuario
exports.crearPedido = async (req, res) => {
  try {
    const { 
      nombre, correo, telefono, direccion, productos, total, notas, sesion_id,
      quiero_factura, dni_comprador, domicilio_comprador // ✅ CAMPOS NUEVOS
    } = req.body;

    // ✅ Validar que no falten datos obligatorios
    if (!nombre || !correo || !telefono || !direccion || !productos || productos.length === 0) {
      return res.status(400).json({ 
        ok: false,
        mensaje: 'Faltan datos. Completá tu nombre, correo, teléfono y dirección.' 
      });
    }

    // ✅ Convertir productos a texto JSON para guardar
    const productosJson = JSON.stringify(productos);

    // ✅ Guardar el pedido en Neon PostgreSQL — con datos de facturación
    const resultado = await db.query(
      `INSERT INTO pedidos 
       (nombre, correo, telefono, direccion, productos, total, notas, estado, sesion_id, fecha,
        quiero_factura, dni_comprador, domicilio_comprador) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'pendiente', $8, NOW(), $9, $10, $11)
       RETURNING id`,
      [
        nombre, correo, telefono, direccion, productosJson, total, notas || '', sesion_id || 'invitado',
        quiero_factura || false, dni_comprador || null, domicilio_comprador || null
      ]
    );

    const pedidoId = resultado.rows[0].id;

    // ✅ SI EL CLIENTE PIDIÓ FACTURA → la generamos y enviamos automáticamente
    if (quiero_factura === true || quiero_factura === 'true') {
      // Esperamos unos segundos para que se confirme el pago
      setTimeout(async () => {
        try {
          const numeroFactura = await enviarCorreoConFactura({
            pedido_id: pedidoId,
            nombre,
            correo,
            dni: dni_comprador,
            domicilio: domicilio_comprador,
            productos,
            total
          });
          console.log(`✅ Factura N° ${numeroFactura} generada y enviada a ${correo}`);
          
          // ✅ Actualizamos el pedido con el número de factura
          await db.query(
            `UPDATE pedidos 
             SET factura_generada = true, factura_numero = $1, fecha_factura = NOW() 
             WHERE id = $2`,
            [numeroFactura, pedidoId]
          );
        } catch (err) {
          console.log('⚠️ No se pudo generar/enviar la factura:', err.message);
        }
      }, 8000); // Espera 8 segundos después de crear el pedido
    }

    res.status(201).json({
      ok: true,
      exito: true,
      mensaje: `¡Gracias ${nombre}! Tu pedido se registró correctamente.`,
      pedidoId: pedidoId
    });

  } catch (error) {
    console.error('❌ Error al crear pedido:', error.message);
    res.status(500).json({ 
      ok: false,
      mensaje: 'Hubo un problema al registrar tu pedido. Intentá nuevamente.' 
    });
  }
};

// ✅ Ver TODOS los pedidos — Panel administrativo
exports.listarPedidos = async (req, res) => {
  try {
    const pedidos = await db.query(
      `SELECT id, nombre, correo, telefono, direccion, total, estado, fecha, sesion_id,
              quiero_factura, factura_generada, factura_numero
       FROM pedidos ORDER BY fecha DESC`
    );
    res.json({ ok: true, datos: pedidos.rows });
  } catch (error) {
    console.error('❌ Error al listar pedidos:', error.message);
    res.status(500).json({ ok: false, mensaje: 'Error al cargar pedidos' });
  }
};

// ✅ Ver MI pedido por sesion_id — Cliente ve SOLO el suyo
exports.verPedidoCliente = async (req, res) => {
  try {
    const sesion_id = req.query.sesion_id;
    if (!sesion_id) {
      return res.status(400).json({ ok: false, mensaje: 'Falta identificación de sesión' });
    }
    const pedidos = await db.query(
      `SELECT *, productos::text FROM pedidos WHERE sesion_id = $1 ORDER BY fecha DESC`,
      [sesion_id]
    );
    // ✅ Parsear JSON de productos
    const datos = pedidos.rows.map(pedido => ({
      ...pedido,
      productos: JSON.parse(pedido.productos)
    }));
    res.json({ ok: true, datos });
  } catch (error) {
    console.error('❌ Error al cargar pedidos del cliente:', error.message);
    res.status(500).json({ ok: false, mensaje: 'Error al cargar tus pedidos' });
  }
};

// ✅ Ver detalle de UN pedido específico
exports.verDetalle = async (req, res) => {
  try {
    const pedido = await db.query(
      `SELECT *, productos::text FROM pedidos WHERE id = $1`,
      [req.params.id]
    );
    if (!pedido.rows.length) {
      return res.status(404).json({ ok: false, mensaje: 'Pedido no encontrado' });
    }
    // ✅ Parsear productos de JSON a objeto
    const datos = {
      pedido: {
        ...pedido.rows[0],
        productos: JSON.parse(pedido.rows[0].productos)
      }
    };
    res.json({ ok: true, datos });
  } catch (error) {
    console.error('❌ Error al cargar detalle:', error.message);
    res.status(500).json({ ok: false, mensaje: 'Error al cargar detalle' });
  }
};