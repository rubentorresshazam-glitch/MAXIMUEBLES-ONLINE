// ===== PÁGINA DE CONFIRMACIÓN DE PAGO =====
window.addEventListener("DOMContentLoaded", () => {
    // 🔹 RECUPERAR EL CARRITO QUE VINO DEL CHECKOUT
    const guardado = localStorage.getItem("carrito_pago");
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
    const pagoId = params.get("payment_id") || params.get("preference_id") || "Pendiente";
    const ordenElem = document.getElementById("mp-orden-id");
    if (ordenElem) ordenElem.textContent = pagoId;

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

// ===== MOSTRAR / OCULTAR CAMPO DE CORREO =====
function mostrarCampoCorreo() {
    const seleccion = document.querySelector('input[name="enviar_factura"]:checked');
    if (!seleccion) return;
    const valor = seleccion.value;
    const campoCorreo = document.getElementById("campo-correo");
    if (!campoCorreo) return;

    if (valor === "si") {
        campoCorreo.classList.add("mostrar");
        campoCorreo.style.display = "block";
    } else {
        campoCorreo.classList.remove("mostrar");
        campoCorreo.style.display = "none";
        // Limpiar el correo cuando oculta el campo
        const correoInput = document.getElementById("correo_cliente");
        if (correoInput) correoInput.value = "";
    }
}

// ===== FUNCIÓN DEL BOTÓN "ACEPTAR" — VALIDA Y ENVÍA =====
async function solicitarFactura() {
    const correoElem = document.getElementById("correo_cliente");
    const pagoIdElem = document.getElementById("mp-orden-id");
    if (!correoElem || !pagoIdElem) return;

    const correo = correoElem.value.trim();
    const pagoId = pagoIdElem.textContent;

    // ✅ VALIDAR QUE NO ESTÉ VACÍO
    if (!correo) {
        alert("⚠️ Por favor escribí tu correo electrónico.");
        correoElem.focus();
        return;
    }

    // ✅ VALIDAR QUE TENGA FORMATO DE CORREO
    if (!correo.includes("@") || correo.length < 5) {
        alert("⚠️ Por favor ingresá un correo electrónico válido.\nEjemplo: nombre@correo.com");
        correoElem.focus();
        return;
    }

    try {
        // ✅ LLAMADA CORRECTA: SIN /api duplicado
        const respuesta = await peticion("/enviar-factura", "POST", {
            correo: correo,
            pago_id: pagoId
        });

        // ✅ RESPUESTA EXITOSA
        if (respuesta.ok) {
            alert(`✅ ¡Listo! Tu factura fue enviada a:\n📧 ${correo}`);
            // Limpiar todo para que quede prolijo
            const form = document.getElementById("form-factura");
            if (form) form.reset();
            const campoCorreo = document.getElementById("campo-correo");
            if (campoCorreo) {
                campoCorreo.classList.remove("mostrar");
                campoCorreo.style.display = "none";
            }
            const radioNo = document.querySelector('input[name="enviar_factura"][value="no"]');
            if (radioNo) radioNo.checked = true;
        } else {
            alert(respuesta.mensaje || "⚠️ No se pudo enviar. Intentá más tarde.");
        }
    } catch (error) {
        console.error("❌ Error al enviar factura:", error);
        alert("⚠️ Ocurrió un problema de conexión. Intentá nuevamente.");
    }
}