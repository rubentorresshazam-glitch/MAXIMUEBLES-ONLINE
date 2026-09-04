const nodemailer = require('nodemailer');

// ✅ Configuración segura desde variables de entorno
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.CORREO_REMITENTE || 'maximueblesventas@gmail.com',
    pass: process.env.CORREO_CONTRASEÑA || 'jhjdhqgjipxqulvf'
  }
});

const enviarMensaje = async (req, res) => {
  try {
    const { nombre, correo, telefono, asunto, mensaje } = req.body;

    if (!nombre || !correo || !asunto || !mensaje) {
      return res.status(400).json({ 
        exito: false, 
        mensaje: 'Faltan datos obligatorios' 
      });
    }

    const contenidoCorreo = {
      from: `"Formulario Web" <${process.env.CORREO_REMITENTE || 'maximueblesventas@gmail.com'}>`,
      to: 'maximueblesventas@gmail.com',
      replyTo: correo,
      subject: `📩 Nuevo mensaje: ${asunto}`,
      html: `
        <h3>📬 Recibiste un nuevo mensaje desde la web</h3>
        <p><strong>Nombre:</strong> ${nombre}</p>
        <p><strong>Correo:</strong> ${correo}</p>
        <p><strong>Teléfono/WhatsApp:</strong> ${telefono || 'No indicó'}</p>
        <p><strong>Asunto:</strong> ${asunto}</p>
        <hr>
        <h4>Mensaje:</h4>
        <p style="font-size: 16px; line-height: 1.6;">${mensaje}</p>
        <hr>
        <p style="color: #666; font-size: 12px;">Mensaje enviado desde el formulario de contacto de Maximuebles</p>
      `
    };

    await transporter.sendMail(contenidoCorreo);

    res.json({ 
      exito: true, 
      mensaje: '✅ Mensaje enviado correctamente. Te responderemos a la brevedad.' 
    });

  } catch (error) {
    console.error('❌ Error al enviar correo:', error.message);
    res.status(500).json({ 
      exito: false, 
      mensaje: '❌ No se pudo enviar el mensaje. Intentá nuevamente o escribinos por WhatsApp.' 
    });
  }
};

module.exports = { enviarMensaje };