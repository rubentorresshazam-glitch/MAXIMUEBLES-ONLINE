// ==================================================
// 🛒 CARRITO DE COMPRAS — MAXIMUEBLES
// Versión mejorada: más limpia, segura y conectada
// ==================================================

document.addEventListener('DOMContentLoaded', async () => {
  console.log("🛒 Página del carrito cargada");
  await mostrarCarrito();
  await actualizarContadorMenu();
});

// ======================================
// ✅ AGREGAR PRODUCTO AL CARRITO
// ======================================
async function agregarAlCarrito(producto) {
  // Leer carrito guardado o crear uno vacío
  let carrito = leerCarritoGuardado();

  // Buscar si el producto ya está
  const existe = carrito.find(item => item.id === producto.id);

  if (existe) {
    // Si ya está → sumar cantidad
    existe.cantidad += producto.cantidad || 1;
  } else {
    // Si no está → agregarlo
    carrito.push({
      id: producto.id,
      nombre: producto.nombre || 'Producto sin nombre',
      precio: Number(producto.precio) || 0,
      cantidad: producto.cantidad || 1
    });
  }

  // Guardar cambios
  guardarCarrito(carrito);
  await actualizarContadorMenu();
  console.log('✅ Producto agregado:', producto.nombre);
  return true;
}

// ======================================
// ✅ MOSTRAR CARRITO EN LA PÁGINA
// Alterna automáticamente: vacío ↔ productos
// ======================================
async function mostrarCarrito() {
  const carrito = leerCarritoGuardado();

  // Elementos de la página
  const pantallaVacia = document.getElementById('pantalla-vacia');
  const listaContenedor = document.getElementById('lista-contenedor');
  const lista = document.getElementById('lista-items');
  const subtotalElem = document.getElementById('subtotal');
  const totalElem = document.getElementById('total');

  if (!lista) return;

  // ✅ CARRITO VACÍO → mostrar mensaje central
  if (carrito.length === 0) {
    pantallaVacia.classList.remove('oculto');
    listaContenedor.classList.add('oculto');
    lista.innerHTML = '';
    return;
  }

  // ✅ HAY PRODUCTOS → mostrar lista
  pantallaVacia.classList.add('oculto');
  listaContenedor.classList.remove('oculto');
  lista.innerHTML = '';

  let totalCompra = 0;

  // Dibujar cada producto
  carrito.forEach(item => {
    const precio = Number(item.precio);
    const cantidad = Number(item.cantidad);
    const subtotal = precio * cantidad;
    totalCompra += subtotal;

    lista.innerHTML += `
      <div class="item-producto">
        <div class="item-img">🛋️</div>
        <div class="item-info">
          <h4>${item.nombre}</h4>
          <p class="item-precio">$ ${precio.toLocaleString('es-AR')}</p>
        </div>
        <div class="item-cantidad">
          <button class="btn-menos" data-id="${item.id}">−</button>
          <span>${cantidad}</span>
          <button class="btn-mas" data-id="${item.id}">+</button>
        </div>
        <div class="item-subtotal">$ ${subtotal.toLocaleString('es-AR')}</div>
        <button class="item-quitar" data-id="${item.id}">✕</button>
      </div>
    `;
  });

  // Actualizar totales
  if (subtotalElem) subtotalElem.textContent = `$ ${totalCompra.toLocaleString('es-AR')}`;
  if (totalElem) totalElem.textContent = `$ ${totalCompra.toLocaleString('es-AR')}`;

  // ✅ Guardar para que checkout.html lo reciba
  localStorage.setItem('carrito_pago', JSON.stringify({
    carrito: carrito,
    totalCompra: totalCompra
  }));

  // Asignar eventos a los botones
  asignarEventosBotones();
}

// ======================================
// ✅ CAMBIAR CANTIDAD DE UN PRODUCTO
// ======================================
async function cambiarCantidad(idProducto, nuevaCantidad) {
  let carrito = leerCarritoGuardado();
  const indice = carrito.findIndex(item => item.id === idProducto);

  if (indice === -1) return;

  if (nuevaCantidad < 1) {
    // Si llega a 0 → eliminar producto
    carrito.splice(indice, 1);
  } else {
    // Actualizar cantidad
    carrito[indice].cantidad = nuevaCantidad;
  }

  guardarCarrito(carrito);
  await mostrarCarrito();
  await actualizarContadorMenu();
}

// ======================================
// ✅ ELIMINAR UN PRODUCTO COMPLETO
// ======================================
async function eliminarProducto(idProducto) {
  let carrito = leerCarritoGuardado();
  carrito = carrito.filter(item => item.id !== idProducto);
  guardarCarrito(carrito);
  await mostrarCarrito();
  await actualizarContadorMenu();
}

// ======================================
// ✅ VACIAR TODO EL CARRITO
// ======================================
async function vaciarCarritoCompleto() {
  if (!confirm('¿Estás seguro de vaciar todo el carrito?')) return;
  localStorage.removeItem('carrito');
  localStorage.removeItem('carrito_pago');
  await mostrarCarrito();
  await actualizarContadorMenu();
}

// ======================================
// ✅ CONTADOR DEL ÍCONO EN EL MENÚ
// ======================================
async function actualizarContadorMenu() {
  const contador = document.getElementById('headerCartCount');
  if (!contador) return;

  const carrito = leerCarritoGuardado();
  const totalProductos = carrito.reduce((s, item) => s + Number(item.cantidad), 0);

  contador.textContent = totalProductos;
  contador.style.display = totalProductos > 0 ? 'flex' : 'none';
}

// ======================================
// 🔧 FUNCIONES AUXILIARES (PROTEGIDAS)
// ======================================

// Leer y validar carrito desde localStorage
function leerCarritoGuardado() {
  const guardado = localStorage.getItem('carrito');
  if (!guardado) return [];

  try {
    const carrito = JSON.parse(guardado);
    if (Array.isArray(carrito)) return carrito;
    return [];
  } catch {
    // Si está corrupto → borrarlo y devolver vacío
    localStorage.removeItem('carrito');
    return [];
  }
}

// Guardar carrito en localStorage
function guardarCarrito(carrito) {
  localStorage.setItem('carrito', JSON.stringify(carrito));
}

// Asignar clics a los botones de cada producto
function asignarEventosBotones() {
  // ➖ MENOS
  document.querySelectorAll('.btn-menos').forEach(btn => {
    btn.addEventListener('click', e => {
      const id = Number(e.target.dataset.id);
      const carrito = leerCarritoGuardado();
      const item = carrito.find(i => i.id === id);
      if (item) cambiarCantidad(id, item.cantidad - 1);
    });
  });

  // ➕ MÁS
  document.querySelectorAll('.btn-mas').forEach(btn => {
    btn.addEventListener('click', e => {
      const id = Number(e.target.dataset.id);
      const carrito = leerCarritoGuardado();
      const item = carrito.find(i => i.id === id);
      if (item) cambiarCantidad(id, item.cantidad + 1);
    });
  });

  // ✕ ELIMINAR
  document.querySelectorAll('.item-quitar').forEach(btn => {
    btn.addEventListener('click', e => {
      const id = Number(e.target.dataset.id);
      eliminarProducto(id);
    });
  });
}

// 🗑️ Botón "Vaciar Carrito"
document.addEventListener('click', e => {
  if (e.target && e.target.id === 'btn-vaciar') {
    vaciarCarritoCompleto();
  }
});

// ✅ Actualizar contador en TODAS las páginas
document.addEventListener('DOMContentLoaded', actualizarContadorMenu);