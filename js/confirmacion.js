// ===== PÁGINA DE CONFIRMACIÓN DE PAGO =====
window.addEventListener("DOMContentLoaded", () => {
    // 🔹 RECUPERAR EL CARRITO Y DATOS QUE VINO DEL CHECKOUT
    const guardado = localStorage.getItem("carrito_pago");
    const pedidoGuardado = JSON.parse(localStorage.getItem("pedido_confirmado") || '{}');
    
    let carrito = [];
    let totalCompra = 0;
    if (guardado) {
        const datos = JSON.parse(guardado);
        carrito = datos.carrito || [];
        totalCompra = datos.totalCompra || 0;
        console.log("✅ Carrito recuperado:", carrito);
        // Mostrar productos
        mostrarProductos(carrito);
        // Mostrar total formateado
        const totalElem = document.getElementById("mp-total");
        if (totalElem) {
            totalElem.textContent = `$ ${totalCompra.toLocaleString("es-AR", { minimumFractionDigits: 2 })}`;
        }
        // ✅ LIMPIAR: borramos el carrito guardado
        localStorage.removeItem("carrito_pago");
    }

    // 🔹 RECIBIR DATOS DE MERCADO PAGO DESDE LA URL
    const params = new URLSearchParams(window.location.search);
    const pagoId = params.get("payment_id") || params.get("preference_id") || pedidoGuardado.pedidoId || "Pendiente";
    const ordenElem = document.getElementById("mp-orden-id");
    if (ordenElem) ordenElem.textContent = pagoId;

    // Guardamos para usar al enviar factura
    window._datosPedido = {
        sesion_id: pedidoGuardado.sesion_id || 'invitado',
        pedidoId: pedidoGuardado.pedidoId || null,
        carrito,
        totalCompra
    };

    // Mostrar fecha y hora actual
    const fecha = new Date().toLocaleString("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
    const fechaElem = document.getElementById("mp-fecha");
    if (fechaElem) fechaElem.textContent = fecha;
});

// ===== MOSTRAR LISTA DE PRODUCTOS =====
function mostrarProductos(carrito) {
    const contenedor = document.getElementById("lista_productos");
    if (!contenedor || !carrito.length) return;
    contenedor.innerHTML = "";
    carrito.forEach(item => {
        const nombre = item.nombre || "Producto";
        const cantidad = item.cantidad || 1;
        const precio = Number(item.precio) || 0;
        const subtotal = precio * cantidad;
        contenedor.innerHTML += `
            <div class="producto-confirmacion">
                <span>${nombre}</span>
                <span>${cantidad} × $ ${precio.toLocaleString("es-AR")} = $ ${subtotal.toLocaleString("es-AR")}</span>
            </div>
        `;
    });
}

// ===== MOSTRAR / OCULTAR FORMULARIO DE FACTURACIÓN =====
function mostrarCampoCorreo() {
    const seleccion = document.querySelector('input[name="enviar_factura"]:checked');
    if (!seleccion) return;
    const valor = seleccion.value;
    const formularioFactura = document.getElementById("campo-correo");
    if (!formularioFactura) return;

    if (valor === "si") {
        formularioFactura.classList.add("mostrar");
        formularioFactura.style.display = "block";
    } else {
        formularioFactura.classList.remove("mostrar");
        formularioFactura.style.display = "none";
        // Limpiar los campos cuando oculta
        document.getElementById("correo_cliente").value = "";
        document.getElementById("dni_factura").value = "";
        document.getElementById("domicilio_factura").value = "";
    }
}

// ===== FUNCIÓN DEL BOTÓN "ACEPTAR" — ENVÍA LA FACTURA =====
async function solicitarFactura() {
    const correoElem = document.getElementById("correo_cliente");
    const dniElem = document.getElementById("dni_factura");
    const domicilioElem = document.getElementById("domicilio_factura");

    if (!correoElem) return;

    const correo = correoElem.value.trim();
    const dni = dniElem ? dniElem.value.trim() : "";
    const domicilio = domicilioElem ? domicilioElem.value.trim() : "";
    const datos = window._datosPedido || {};

    // ✅ VALIDAR CORREO
    if (!correo) {
        alert("⚠️ Por favor escribí tu correo electrónico.");
        correoElem.focus();
        return;
    }
    if (!correo.includes("@") || correo.length < 5) {
        alert("⚠️ Ingresá un correo válido.\nEjemplo: nombre@correo.com");
        correoElem.focus();
        return;
    }

    try {
        // ✅ LLAMAMOS A TU RUTA DE FACTURACIÓN
        const respuesta = await peticion("/pedidos/actualizar-factura", "POST", {
            sesion_id: datos.sesion_id,
            correo_factura: correo,
            dni_comprador: dni,
            domicilio_comprador: domicilio
        });

        if (respuesta.ok) {
            alert(`✅ ¡Listo! Tu factura fue enviada a:\n📧 ${correo}`);
            // ✅ Limpiar todo
            document.getElementById("form-factura").reset();
            document.getElementById("campo-correo").style.display = "none";
            document.querySelector('input[name="enviar_factura"][value="no"]').checked = true;
        } else {
            alert("⚠️ " + (respuesta.mensaje || "No se pudo enviar. Intentá más tarde."));
        }
    } catch (error) {
        console.error("❌ Error:", error);
        alert("⚠️ Problema de conexión. Intentá nuevamente.");
    }
}