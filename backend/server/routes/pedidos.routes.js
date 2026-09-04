const express = require('express');
const router = express.Router();
const pedidoController = require('../controllers/pedidos.controller');

// ✅ Crear pedido SIN cuenta de usuario → POST /api/pedidos
router.post('/', pedidoController.crearPedido);

// ✅ Ver todos los pedidos (Panel administrativo) → GET /api/pedidos
router.get('/', pedidoController.listarPedidos);

// ✅ Ver detalle de un pedido → GET /api/pedidos/:id
router.get('/:id', pedidoController.verDetalle);

module.exports = router;