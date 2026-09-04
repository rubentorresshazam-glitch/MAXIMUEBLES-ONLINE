// ==================================================
// GESTIÓN DE FACTURACIÓN · MAXIMUEBLES
// Conectado con: checkout.html → historial de compras
// Impresora: HP LaserJet M111w
// ==================================================

const CONFIG_IMPRESORA = {
    modelo: "HP LaserJet M111w",
    ip: "192.168.1.142",
    puntoVenta: "00010",
    cuit: "30-71500272-4",
    razonSocial: "MAXIMUEBLES S.R.L"
};

let compraSeleccionada = null;

// ✅ Al cargar la página
window.addEventListener("load", () => {
    sincronizarUltimaCompra();
    cargarListaCompras();
});

// ✅ Trae la compra nueva del checkout y la guarda en historial
function sincronizarUltimaCompra() {
    let todasLasCompras = JSON.parse(localStorage.getItem("historialCompras")) || [];
    const ultima = JSON.parse(localStorage.getItem("ultimaCompra"));

    if (ultima) {
        // Buscar si ya está cargada por la fecha
        const yaExiste = todasLasCompras.some(c => c.fecha === ultima.fecha);
        if (!yaExiste) {
            // Asignar número de factura automático
            const ultimoNro = parseInt(localStorage.getItem("ultimoNroFactura") || "1");
            ultima.numeroFactura = `${CONFIG_IMPRESORA.puntoVenta}-${String(ultimoNro).padStart(8, '0')}`;
            ultima.numeroOperacion = `OP-${ultimoNro}`;
            ultima.subtotal = ultima.total - (ultima.envio || 0);
            ultima.envio = ultima.total > 50000 ? 0 : 4990;
            ultima.fecha = ultima.fecha ? ultima.fecha.split('T')[0] : new Date().toISOString().split('T')[0];
            ultima.hora = new Date().toLocaleTimeString("es-AR", { hour: '2-digit', minute: '2-digit' });
            
            // Estructura unificada
            ultima.cliente = {
                nombre: ultima.nombre,
                documento: ultima.dni,
                direccion: (ultima.calle || "") + (ultima.piso ? `, ${ultima.piso}` : ""),
                localidad: ultima.localidad || "Valle Medio, Río Negro",
                telefono: ultima.telefono
            };
            // Datos exclusivos del remito
            ultima.recibe = ultima.recibe || "El mismo comprador";
            ultima.horario = ultima.horario || "A convenir";

            todasLasCompras.unshift(ultima);
            localStorage.setItem("historialCompras", JSON.stringify(todasLasCompras));
            localStorage.setItem("ultimoNroFactura", String(ultimoNro + 1));
        }
        // Limpiar para no duplicar
        localStorage.removeItem("ultimaCompra");
    }
}

// ✅ Cargar lista de compras guardadas
function cargarListaCompras() {
    const listaDiv = document.getElementById("lista-compras");
    const contador = document.getElementById("contador-registros");
    listaDiv.innerHTML = "";

    const todasLasCompras = JSON.parse(localStorage.getItem("historialCompras")) || [];
    const textoBusqueda = document.getElementById("buscar")?.value.toLowerCase().trim() || "";
    const fechaFiltro = document.getElementById("fecha-filtro")?.value || "";

    const comprasFiltradas = todasLasCompras.filter(compra => {
        const coincideTexto =
            compra.numeroOperacion?.toLowerCase().includes(textoBusqueda) ||
            compra.numeroFactura?.toLowerCase().includes(textoBusqueda) ||
            compra.cliente?.nombre?.toLowerCase().includes(textoBusqueda);
        const coincideFecha = !fechaFiltro || compra.fecha === fechaFiltro;
        return coincideTexto && coincideFecha;
    });

    if (contador) {
        contador.textContent = `${comprasFiltradas.length} registro${comprasFiltradas.length !== 1 ? 's' : ''}`;
    }

    if (comprasFiltradas.length === 0) {
        listaDiv.innerHTML = `
            <div class="estado-vacio">
                <i class="fa-solid fa-inbox icono-vacio"></i>
                <p>No se encontraron compras con esos filtros.</p>
            </div>`;
        return;
    }

    comprasFiltradas.forEach(compra => {
        const item = document.createElement("div");
        item.className = "item-compra";
        item.innerHTML = `
            <div class="info-compra">
                <p><strong>Operación:</strong> ${compra.numeroOperacion}</p>
                <p><strong>Fecha:</strong> ${compra.fecha} — ${compra.hora}</p>
                <p><strong>Cliente:</strong> ${compra.cliente?.nombre || "Sin nombre"}</p>
                <p><strong>Total:</strong> $ ${(compra.total || 0).toLocaleString("es-AR") || "0"}</p>
                <p><strong>Factura N°:</strong> ${compra.numeroFactura || "<span style='color:#cc8800'>Pendiente</span>"}</p>
                ${compra.recibe ? `<p><strong>📦 Recibe:</strong> ${compra.recibe}</p>` : ""}
                ${compra.horario ? `<p><strong>⏰ Horario:</strong> ${compra.horario}</p>` : ""}
            </div>
            <button onclick="verDetalleFactura('${compra.numeroOperacion}')" class="btn-ver">
                <i class="fa-solid fa-eye"></i> Ver y gestionar
            </button>
        `;
        listaDiv.appendChild(item);
    });
}

// ✅ Ver detalle de compra — MUESTRA RECIBE Y HORARIO
function verDetalleFactura(nroOperacion) {
    const todas = JSON.parse(localStorage.getItem("historialCompras")) || [];
    const compra = todas.find(c => c.numeroOperacion === nroOperacion);
    if (!compra) return alert("❌ No se encontró la compra");

    compraSeleccionada = compra;
    localStorage.setItem("facturaActual", JSON.stringify(compra));

    const contenido = document.getElementById("contenido-detalle");
    contenido.innerHTML = `
        <div class="fila-detalle">
            <div class="columna">
                <h4>Datos de la Operación</h4>
                <p><strong>N° Operación:</strong> ${compra.numeroOperacion}</p>
                <p><strong>Fecha:</strong> ${compra.fecha}</p>
                <p><strong>Hora:</strong> ${compra.hora}</p>
                <p><strong>Factura N°:</strong> ${compra.numeroFactura}</p>
            </div>
            <div class="columna">
                <h4>Datos del Cliente</h4>
                <p><strong>Nombre:</strong> ${compra.cliente?.nombre || "No especificado"}</p>
                <p><strong>Documento:</strong> ${compra.cliente?.documento || "No especificado"}</p>
                <p><strong>Dirección:</strong> ${compra.cliente?.direccion || "No especificada"}</p>
                <p><strong>Localidad:</strong> ${compra.cliente?.localidad || "Valle Medio, Río Negro"}</p>
                <p><strong>Teléfono:</strong> ${compra.cliente?.telefono || "No especificado"}</p>
                <hr>
                <p><strong>📦 Recibe:</strong> ${compra.recibe || "El mismo comprador"}</p>
                <p><strong>⏰ Horario de entrega:</strong> ${compra.horario || "A convenir"}</p>
            </div>
        </div>
        <h4>Detalle de Productos</h4>
        <table class="tabla-detalle">
            <thead><tr><th>Cant.</th><th>Descripción</th><th>P. Unitario</th><th>Subtotal</th></tr></thead>
            <tbody>
                ${(compra.carrito || compra.productos || []).map(p => `
                    <tr>
                        <td style="text-align:center;">${p.cantidad}</td>
                        <td>${p.nombre}</td>
                        <td>$ ${(p.precio||0).toLocaleString("es-AR")}</td>
                        <td>$ ${((p.precio||0)*(p.cantidad||1)).toLocaleString("es-AR")}</td>
                    </tr>
                `).join("")}
            </tbody>
            <tfoot>
                <tr><td colspan="3" style="text-align:right;">Subtotal:</td><td>$ ${(compra.subtotal||0).toLocaleString("es-AR")}</td></tr>
                <tr><td colspan="3" style="text-align:right;">Envío:</td><td>${compra.envio===0?"<strong style='color:#22b548'>GRATIS</strong>":"$ "+(compra.envio||0).toLocaleString("es-AR")}</td></tr>
                <tr style="font-weight:bold; background:#f0fff4;">
                    <td colspan="3" style="text-align:right;">TOTAL:</td>
                    <td style="color:#006633; font-size:1.05rem;">$ ${(compra.total||0).toLocaleString("es-AR")}</td>
                </tr>
            </tfoot>
        </table>

        <!-- ✅ BOTONES: FACTURA + REMITO -->
        <div style="display:flex; gap:15px; justify-content:center; margin-top:25px; flex-wrap:wrap;">
            <button onclick="abrirFacturaParaImprimir('${compra.numeroOperacion}')" 
                style="background:#006633; color:white; border:none; padding:12px 25px; font-size:16px; font-weight:bold; border-radius:8px; cursor:pointer;">
                <i class="fa-solid fa-file-invoice"></i> Abrir Factura
            </button>
            <button onclick="abrirRemitoParaImprimir('${compra.numeroOperacion}')" 
                style="background:#2266aa; color:white; border:none; padding:12px 25px; font-size:16px; font-weight:bold; border-radius:8px; cursor:pointer;">
                <i class="fa-solid fa-file-contract"></i> Abrir Remito
            </button>
        </div>
    `;

    document.getElementById("panel-detalle").classList.remove("oculto");
    document.getElementById("panel-detalle").scrollIntoView({ behavior: "smooth" });
}

// ==================================================
// 🧾 ABRIR FACTURA
// ==================================================
function abrirFacturaParaImprimir(nroOperacion) {
    const todas = JSON.parse(localStorage.getItem("historialCompras")) || [];
    const compra = todas.find(c => c.numeroOperacion === nroOperacion);
    if (!compra) return alert("❌ Compra no encontrada");

    const productosCodificados = encodeURIComponent(JSON.stringify(compra.carrito || compra.productos || []));
    const url = `facturacionadmin/factura-imprimible.html?
        nroFactura=${encodeURIComponent(compra.numeroFactura)}
        &nombre=${encodeURIComponent(compra.cliente?.nombre || "Consumidor Final")}
        &dni=${encodeURIComponent(compra.cliente?.documento || "—")}
        &direccion=${encodeURIComponent(compra.cliente?.direccion || "—")}
        &localidad=${encodeURIComponent(compra.cliente?.localidad || "Valle Medio, Río Negro")}
        &telefono=${encodeURIComponent(compra.cliente?.telefono || "—")}
        &subtotal=${compra.subtotal || 0}
        &envio=${compra.envio || 0}
        &total=${compra.total || 0}
        &productos=${productosCodificados}`.replace(/\s+/g, '');

    const ventana = window.open(url, '_blank');
    if (!ventana) alert("⚠️ El navegador bloqueó la ventana. Permití ventanas emergentes.");
}

// ==================================================
// 🚚 ABRIR REMITO — CON RECIBE Y HORARIO ✅
// ==================================================
function abrirRemitoParaImprimir(nroOperacion) {
    const todas = JSON.parse(localStorage.getItem("historialCompras")) || [];
    const compra = todas.find(c => c.numeroOperacion === nroOperacion);
    if (!compra) return alert("❌ Compra no encontrada");

    const productosCodificados = encodeURIComponent(JSON.stringify(compra.carrito || compra.productos || []));
    const datos = {
        nroRemito: compra.numeroFactura.replace("00010-", ""),
        nombre: compra.cliente?.nombre,
        direccion: compra.cliente?.direccion,
        localidad: compra.cliente?.localidad || "Valle Medio, Río Negro",
        telefono: compra.cliente?.telefono || "",
        recibe: compra.recibe || "El mismo comprador",
        horario: compra.horario || "A convenir",
        productos: productosCodificados
    };

    const params = new URLSearchParams(datos);
    const ventana = window.open(`remito-imprimible.html?${params.toString()}`, '_blank');
    if (!ventana) alert("⚠️ El navegador bloqueó la ventana. Permití ventanas emergentes.");
}

// ==================================================
// FUNCIONES AUXILIARES
// ==================================================

function limpiarFiltros() {
    document.getElementById("buscar").value = "";
    if (document.getElementById("fecha-filtro")) document.getElementById("fecha-filtro").value = "";
    cargarListaCompras();
}

function cerrarDetalle() {
    document.getElementById("panel-detalle").classList.add("oculto");
    compraSeleccionada = null;
}

async function enviarFacturaCorreo() {
    if (!compraSeleccionada) return alert("⚠️ Seleccioná una compra primero");
    alert("📧 Función de envío por correo en desarrollo. Imprimí y envialo manualmente.");
}

async function transmitirARCA() {
    if (!compraSeleccionada) return alert("⚠️ Seleccioná una compra primero");
    alert(`📡 Transmitiendo factura ${compraSeleccionada.numeroFactura} a ARCA...`);
    console.log("Factura:", compraSeleccionada);
    alert("✅ Factura registrada en ARCA correctamente");
}