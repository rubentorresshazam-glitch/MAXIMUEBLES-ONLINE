const params = new URLSearchParams(window.location.search);
const id = Number(params.get('id'));
let productoActual = null;

function limpiarTexto(texto) {
    if (!texto) return '';
    return texto.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
}

// ✅ Obtener imagen o respaldo si no tiene
function obtenerImagen(imagenes, nombreProducto) {
    if (!imagenes || imagenes === null || imagenes.trim() === '') {
        return null;
    }
    try {
        const img = Array.isArray(imagenes) ? imagenes[0] : imagenes;
        return img;
    } catch {
        return null;
    }
}

// ✅ Cargar producto desde el servidor — RUTA CORREGIDA
async function cargarProducto() {
    if (!id) {
        console.error('❌ Falta el ID del producto');
        return;
    }
    // ✅ CORREGIDO: ruta que coincide con tu servidor → /productos/:id
    const respuesta = await peticion(`/productos/${id}`);

    if (respuesta.ok && respuesta.datos) {
        productoActual = respuesta.datos;

        // ✅ Nombre
        document.getElementById('nombre-producto').textContent = productoActual.nombre || 'Producto';

        // ✅ Precio
        document.getElementById('precio-actual').textContent = productoActual.precio
            ? `$ ${Number(productoActual.precio).toLocaleString('es-AR')}`
            : '';

        // ✅ Descripción
        document.getElementById('descripcion-larga-texto').textContent = limpiarTexto(productoActual.descripcion);

        // ✅ Imagen con respaldo
        const imagenUrl = obtenerImagen(productoActual.imagenes, productoActual.nombre);
        const imgElemento = document.getElementById('img-principal');

        if (imagenUrl) {
            imgElemento.src = imagenUrl;
            imgElemento.alt = productoActual.nombre;
            imgElemento.style.display = '';
        } else {
            // ✅ Sin imagen → cuadro de color con nombre
            imgElemento.style.display = 'none';
            const contenedorImg = imgElemento.parentElement;
            if (contenedorImg) {
                contenedorImg.innerHTML = `
                    <div style="width:100%;height:350px;background:#e9ecef;display:flex;align-items:center;justify-content:center;color:#495057;font-weight:bold;text-align:center;padding:20px;font-size:18px;">
                        ${productoActual.nombre || 'Producto'}
                    </div>
                `;
            }
        }
    } else {
        console.error('❌ No se pudo cargar el producto:', respuesta?.mensaje || 'Error desconocido');
    }
}

// ✅ Botones de cantidad
document.getElementById('btn-menos').addEventListener('click', () => {
    const input = document.getElementById('cantidad');
    const val = parseInt(input.value);
    if (val > 1) input.value = val - 1;
});

document.getElementById('btn-mas').addEventListener('click', () => {
    const input = document.getElementById('cantidad');
    const val = parseInt(input.value);
    if (val < 10) input.value = val + 1;
});

// ✅ Botón: Agregar al carrito
document.getElementById('btn-agregar').addEventListener('click', async () => {
    if (!productoActual) {
        alert('⏳ Esperá un momento que termine de cargar');
        return;
    }
    const cantidad = parseInt(document.getElementById('cantidad').value) || 1;
    const imagenUrl = obtenerImagen(productoActual.imagenes, productoActual.nombre);

    // ✅ Pasa el OBJETO COMPLETO como espera carrito.js
    const producto = {
        id: productoActual.id || id,
        nombre: productoActual.nombre || 'Producto',
        precio: parseFloat(productoActual.precio) || 0,
        imagenes: imagenUrl || '',
        cantidad: cantidad
    };

    if (typeof agregarAlCarrito === 'function') {
        agregarAlCarrito(producto);
        const btn = document.getElementById('btn-agregar');
        btn.innerHTML = '<i class="fa-solid fa-check"></i> ¡Agregado!';
        btn.style.background = '#1a8a36';
        setTimeout(() => {
            btn.innerHTML = '<i class="fa-solid fa-cart-plus"></i> Agregar al carrito';
            btn.style.background = '';
        }, 1800);
    }
});

// ✅ Botón: Comprar AHORA
document.getElementById('btn-comprar-ahora').addEventListener('click', () => {
    if (!productoActual) {
        alert('⏳ Esperá un momento que termine de cargar');
        return;
    }
    const cantidad = parseInt(document.getElementById('cantidad').value) || 1;
    const imagenUrl = obtenerImagen(productoActual.imagenes, productoActual.nombre);

    // ✅ Guardar SOLO este producto como carrito temporal
    const compraDirecta = [{
        id: productoActual.id || id,
        nombre: productoActual.nombre || 'Producto',
        precio: parseFloat(productoActual.precio) || 0,
        imagenes: imagenUrl || '',
        cantidad: cantidad
    }];

    // ✅ Reemplazar el carrito actual y salir al checkout
    localStorage.setItem('carrito', JSON.stringify(compraDirecta));
    window.location.href = '/mi-cuenta/checkout.html';
});

// ✅ Botón favorito
document.getElementById('btn-favorito').addEventListener('click', function () {
    this.classList.toggle('activo');
    const icono = this.querySelector('i');
    icono.classList.toggle('fa-regular');
    icono.classList.toggle('fa-solid');
});

// ✅ Cargar al iniciar
document.addEventListener('DOMContentLoaded', cargarProducto);