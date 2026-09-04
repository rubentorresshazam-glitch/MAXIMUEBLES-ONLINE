document.addEventListener('DOMContentLoaded', async () => {
  // ==============================================
  // ✅ SOLO CAMBIÁ ESTA LÍNEA POR CADA SECCIÓN
  // ==============================================
  const CATEGORIA = "ofertas";
  // ==============================================

  // ✅ CORREGIDO: usa el ID del HTML
  const grilla = document.getElementById('productos-grid');
  if (!grilla) return;

  grilla.innerHTML = `<p class="mensaje-cargando">Cargando productos...</p>`;

  // ✅ CORREGIDO: SIN /api duplicado
  const respuesta = await peticion('/productos');
  if (!respuesta.ok || !respuesta.datos) {
    grilla.innerHTML = `<p class="mensaje-vacio">No se pudieron cargar los productos.</p>`;
    return;
  }

  // ✅ FILTRA SOLO LOS DE ESTA CATEGORÍA
  const productos = respuesta.datos.filter(p => {
    const catServidor = (p.categoria || '').trim().toLowerCase();
    const catBuscada = CATEGORIA.trim().toLowerCase();
    return catServidor === catBuscada;
  });

  grilla.innerHTML = '';

  if (productos.length === 0) {
    grilla.innerHTML = `<p class="mensaje-vacio">Por el momento no hay productos en esta categoría.</p>`;
    return;
  }

  // ✅ DIBUJA LAS TARJETAS — SIN IMAGEN EXTERNA
  productos.forEach(prod => {
    const precio = Number(prod.precio);
    // ✅ Si no hay imagen → cuadro gris con el nombre (sin servicios externos)
    const tieneImagen = prod.imagenes && prod.imagenes !== null && prod.imagenes.trim() !== '';
    const tarjeta = document.createElement('div');
    tarjeta.className = 'producto-card';
    tarjeta.dataset.categoria = prod.categoria || '';
    tarjeta.dataset.precio = precio;
    tarjeta.dataset.nombre = prod.nombre || '';

    if (tieneImagen) {
      const imgUrl = prod.imagenes.split(',')[0].trim();
      tarjeta.innerHTML = `
        <a href="/producto-detalles.html?id=${prod.id}" class="enlace-producto">
          <img src="${imgUrl}" alt="${prod.nombre}" class="img-producto" loading="lazy">
          <h3>${prod.nombre}</h3>
          <div class="producto-descripcion">${prod.descripcion || ''}</div>
          <p class="producto-stock">Stock: ${prod.stock} unidades.</p>
          <span class="producto-precio">$ ${precio.toLocaleString('es-AR')}</span>
        </a>
        <button class="btn-agregar" data-id="${prod.id}" data-nombre="${prod.nombre}" data-precio="${precio}">
          <i class="fa-solid fa-cart-plus"></i> Agregar al carrito
        </button>
      `;
    } else {
      // ✅ SIN imagen → cuadro de color local (sin depender de servicios externos)
      tarjeta.innerHTML = `
        <a href="/producto-detalles.html?id=${prod.id}" class="enlace-producto">
          <div style="width:100%;height:200px;background:#e9ecef;display:flex;align-items:center;justify-content:center;color:#495057;font-weight:bold;text-align:center;padding:10px;font-size:16px;">
            ${prod.nombre}
          </div>
          <h3>${prod.nombre}</h3>
          <div class="producto-descripcion">${prod.descripcion || ''}</div>
          <p class="producto-stock">Stock: ${prod.stock} unidades.</p>
          <span class="producto-precio">$ ${precio.toLocaleString('es-AR')}</span>
        </a>
        <button class="btn-agregar" data-id="${prod.id}" data-nombre="${prod.nombre}" data-precio="${precio}">
          <i class="fa-solid fa-cart-plus"></i> Agregar al carrito
        </button>
      `;
    }

    grilla.appendChild(tarjeta);
  });

  // ✅ BOTÓN AGREGAR AL CARRITO — pasa el OBJETO completo
  document.querySelectorAll('.btn-agregar').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      const boton = e.target.closest('.btn-agregar');
      const producto = {
        id: Number(boton.dataset.id),
        nombre: boton.dataset.nombre,
        precio: Number(boton.dataset.precio),
        cantidad: 1
      };

      if (typeof agregarAlCarrito === 'function') {
        const ok = await agregarAlCarrito(producto);
        if (ok) {
          boton.innerHTML = `<i class="fa-solid fa-check"></i> ¡Agregado!`;
          boton.style.background = '#28a745';
          setTimeout(() => {
            boton.innerHTML = `<i class="fa-solid fa-cart-plus"></i> Agregar al carrito`;
            boton.style.background = '';
          }, 2000);
        }
      }
    });
  });
});

// ===== BUSCADOR + FILTROS =====
function aplicarFiltros() {
  const texto = document.getElementById('buscador-productos')?.value.toLowerCase().trim() || '';
  const categoria = document.getElementById('filtro-categoria')?.value || '';
  const precioRango = document.getElementById('filtro-precio')?.value || '';
  const orden = document.getElementById('filtro-orden')?.value || '';

  // ✅ CORREGIDO: usa el ID del contenedor
  let productos = Array.from(document.querySelectorAll('#productos-grid > div'));

  // 🔍 Buscar por nombre
  productos = productos.filter(tarjeta => {
    const todoTexto = tarjeta.textContent.toLowerCase();
    return texto === '' || todoTexto.includes(texto);
  });

  // 📂 Filtrar por categoría
  productos = productos.filter(tarjeta => {
    const cat = (tarjeta.dataset.categoria || '').toLowerCase();
    return categoria === '' || cat === categoria.toLowerCase();
  });

  // 💰 Filtrar por precio
  if (precioRango) {
    const [min, max] = precioRango.split('-').map(Number);
    productos = productos.filter(tarjeta => {
      const precio = Number(tarjeta.dataset.precio || 0);
      return precio >= min && precio <= max;
    });
  }

  // ↕️ Ordenar
  if (orden === 'nombre-az') {
    productos.sort((a, b) => (a.dataset.nombre || '').localeCompare(b.dataset.nombre || ''));
  } else if (orden === 'precio-menor') {
    productos.sort((a, b) => Number(a.dataset.precio || 0) - Number(b.dataset.precio || 0));
  } else if (orden === 'precio-mayor') {
    productos.sort((a, b) => Number(b.dataset.precio || 0) - Number(a.dataset.precio || 0));
  }

  // ✅ Mostrar resultados
  document.querySelectorAll('#productos-grid > div').forEach(t => t.style.display = 'none');
  productos.forEach(t => t.style.display = '');

  const contador = document.getElementById('cantidad-resultados');
  if (contador) {
    contador.textContent = `${productos.length} producto(s)`;
  }
}