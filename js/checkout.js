let mp;
let totalCompra = 0;
let carrito = [];
const CLAVE_PUBLICA_MP = "APP_USR-8dbfc25a-2ce6-4d62-a5d3-6b72841f1a46";

window.addEventListener("load", async () => {
  if (window.MercadoPago) {
    mp = new MercadoPago(CLAVE_PUBLICA_MP, { locale: "es-AR" });
  }
  cambiarPantalla("paso-envio");
  await cargarResumenCarrito();
});

function cambiarPantalla(id) {
  document.querySelectorAll(".checkout-screen").forEach(p => p.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

function irPaso(n) {
  const pasos = ["paso-envio", "paso-empresa", "paso-pago", "paso-resumen"];
  cambiarPantalla(pasos[n - 1]);
  if (n === 4) cargarResumenFinal();
}

// ✅ CARGA EL CARRITO — SIN INICIO DE SESIÓN
async function cargarResumenCarrito() {
  totalCompra = 0;
  carrito = [];
  const carritoGuardado = localStorage.getItem("carrito");
  if (carritoGuardado) {
    try {
      carrito = JSON.parse(carritoGuardado);
    } catch {
      carrito = [];
    }
  }

  if (!carrito.length) {
    alert("Tu carrito está vacío");
    window.location.href = "/mi-cuenta/carrito.html";
    return;
  }

  const lista = document.getElementById("lista_productos");
  lista.innerHTML = "";
  carrito.forEach(item => {
    const subt = Number(item.precio || 0) * Number(item.cantidad || 1);
    totalCompra += subt;
    lista.innerHTML += `<p>${item.nombre || 'Producto'} × ${item.cantidad} = <strong>$ ${subt.toLocaleString("es-AR")}</strong></p>`;
  });

  const envio = totalCompra > 50000 ? 0 : 4990;
  totalCompra += envio;
  document.getElementById("res_subtotal").textContent = `$ ${(totalCompra - envio).toLocaleString("es-AR")}`;
  document.getElementById("res_envio").textContent = envio ? `$ ${envio.toLocaleString("es-AR")}` : "GRATIS";
  document.getElementById("res_total").textContent = `$ ${totalCompra.toLocaleString("es-AR")}`;
}

// ✅ CARGA LOS DATOS EN EL RESUMEN
function cargarResumenFinal() {
  document.getElementById("res_nombre").textContent = document.getElementById("nombre").value || "-";
  document.getElementById("res_dni").textContent = document.getElementById("dni").value || "-";
  document.getElementById("res_telefono").textContent = document.getElementById("telefono").value || "-";

  const calle = document.getElementById("calle").value;
  const piso = document.getElementById("piso").value;
  const cp = document.getElementById("cp").value;
  const loc = document.getElementById("localidad").value;
  const prov = "Río Negro";

  let domicilioCompleto = calle;
  if (piso) domicilioCompleto += `, ${piso}`;
  domicilioCompleto += ` — ${loc} (${cp}), ${prov}`;

  document.getElementById("res_domicilio").textContent = domicilioCompleto;
  document.getElementById("res_metodo_pago").textContent = "Pagar con Mercado Pago";
}

// ✅ PAGO — CORREGIDO: usa peticion() SIN /api + id → producto_id
async function procesarPago() {
  const nombre = document.getElementById("nombre").value.trim();
  const dni = document.getElementById("dni").value.trim();
  const calle = document.getElementById("calle").value.trim();
  const cp = document.getElementById("cp").value.trim();
  const localidad = document.getElementById("localidad").value;
  const telefono = document.getElementById("telefono").value.trim();

  if (!nombre || !dni || !calle || !cp || !localidad || !telefono) {
    alert("⚠️ Completá todos los datos obligatorios por favor");
    return;
  }

  alert("✅ Preparando el pago... en unos segundos irás a Mercado Pago");

  // ✅ Convertimos id → producto_id para que lo entienda el servidor
  const carritoParaEnviar = carrito.map(item => ({
    producto_id: item.id,
    cantidad: item.cantidad,
    nombre: item.nombre,
    precio: item.precio
  }));

  const datosCompra = {
    carrito: carritoParaEnviar,
    total: totalCompra,
    nombre: nombre,
    dni: dni,
    calle: calle,
    piso: document.getElementById("piso").value.trim(),
    cp: cp,
    localidad: localidad,
    provincia: "Río Negro",
    telefono: telefono,
    recibe: document.getElementById("recibe").value.trim() || "El mismo comprador",
    horario: document.getElementById("horario").value || "A convenir",
    fecha: new Date().toISOString()
  };

  localStorage.setItem("ultimaCompra", JSON.stringify(datosCompra));
  localStorage.setItem("carrito_pago", JSON.stringify({ carrito: carritoParaEnviar, totalCompra }));

  // ✅ LLAMADA CORRECTA: SOLO "/pagar" → api.js ya pone el resto
  const resp = await peticion("/pagar", "POST", {
    carrito: carritoParaEnviar,
    datos: datosCompra
  });

  console.log("RESPUESTA FINAL:", resp);

  if (resp.ok && resp.datos && resp.datos.link_pago) {
    alert("✅ ¡Listo! A continuación serás redirigido a Mercado Pago para finalizar tu compra");
    window.location.href = resp.datos.link_pago;
  } else {
    alert(resp.mensaje || "No se pudo generar el enlace de pago");
  }
}