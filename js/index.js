// ==================================================
// 🏠 PÁGINA DE INICIO — CARGA PRODUCTOS EN OFERTA
// Lee productos DESDE LA API (categoría = "ofertas")
// ==================================================
document.addEventListener('DOMContentLoaded', async () => {
  console.log('🏠 Página de Inicio cargada — Cargando ofertas...');
  await cargarOfertas();
});

// ✅ TRAE SOLO LOS PRODUCTOS CON CATEGORÍA "ofertas"
async function cargarOfertas() {
  try {
    const grilla = document.getElementById('ofertas-grid');
    if (!grilla) return;

    // Mostrar mensaje de carga
    grilla.innerHTML = `<p class="mensaje-cargando">Cargando ofertas...</p>`;

    // ✅ Pide TODOS los productos
    const respuesta = await peticion('/productos');
    if (!respuesta.ok || !respuesta.datos) {
      grilla.innerHTML = `
        <p class="mensaje-error">No se pudieron cargar las ofertas. Intenta más tarde.</p>`;
      return;
    }

    // ✅ FILTRA SOLO LOS DE CATEGORÍA "ofertas"
    const ofertas = respuesta.datos.filter(p => {
      const catServidor = (p.categoria || '').trim().toLowerCase();
      return catServidor === 'ofertas';
    });

    if (ofertas.length === 0) {
      grilla.innerHTML = `
        <p class="mensaje-vacio">
          🎉 Por ahora no hay ofertas activas.<br>
          <a href="/pages/ofertas.html">Ver página de ofertas</a>
        </p>`;
      return;
    }

    // ✅ Dibujar las tarjetas
    grilla.innerHTML = '';
    ofertas.forEach(producto => {
      const tarjeta = crearTarjetaProducto(producto);
      grilla.innerHTML += tarjeta;
    });

    // ✅ ASOCIAR BOTONES AL CARRITO
    document.querySelectorAll('.agregar-carrito').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const boton = e.target.closest('.agregar-carrito');
        const id = Number(boton.dataset.id);
        const nombre = boton.dataset.nombre;
        const precio = Number(boton.dataset.precio);

        const producto = {
          id: id,
          nombre: nombre,
          precio: precio,
          cantidad: 1
        };

        if (typeof agregarAlCarrito === 'function') {
          agregarAlCarrito(producto);
          boton.innerHTML = `<i class="fa-solid fa-check"></i> ¡Agregado!`;
          boton.style.background = '#28a745';
          setTimeout(() => {
            boton.innerHTML = `<i class="fa-solid fa-cart-plus"></i> Agregar`;
            boton.style.background = '';
          }, 2000);
        }
      });
    });

    console.log(`✅ ${ofertas.length} ofertas cargadas`);
  } catch (error) {
    console.error('❌ Error cargando ofertas:', error);
    const grilla = document.getElementById('ofertas-grid');
    if (grilla) {
      grilla.innerHTML = `
        <p class="mensaje-error">No se pudieron cargar las ofertas. Intenta más tarde.</p>`;
    }
  }
}

// ✅ FORMATO DE TARJETA — ENLACE CORREGIDO
function crearTarjetaProducto(producto) {
  const precio = Number(producto.precio).toLocaleString('es-AR');
  const imagen = producto.imagenes 
    ? producto.imagenes.split(',')[0].trim() 
    : '/assets/sin-imagen.jpg';

  return `
    <article class="product-card">
      <div class="product-badge oferta"><span>¡OFERTA!</span></div>
      <div class="product-img-container">
        <a href="/producto-detalle.html?id=${producto.id}">
          <img src="${imagen}" alt="${producto.nombre}" class="product-image" loading="lazy">
        </a>
      </div>
      <div class="product-info">
        <h3 class="product-name">${producto.nombre}</h3>
        <p class="product-mini-desc">${(producto.descripcion || '').substring(0, 60)}...</p>
        <div class="product-price">$ ${precio}</div>
        <p class="product-installment">Hasta 12 cuotas sin interés</p>
        <div class="product-buttons">
          <button class="product-btn agregar-carrito" 
                  data-id="${producto.id}"
                  data-nombre="${producto.nombre}"
                  data-precio="${producto.precio}">
            <i class="fa-solid fa-cart-plus"></i> Agregar
          </button>
          <a href="/producto-detalle.html?id=${producto.id}" class="product-btn ver-detalle">
            <i class="fa-solid fa-eye"></i> Ver
          </a>
        </div>
      </div>
    </article>
  `;
}