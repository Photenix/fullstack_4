const nodemailer = require('nodemailer');

// Configura el transportador de Nodemailer
const Transporter = nodemailer.createTransport({
  service: 'gmail', // o el servicio que estés utilizando
  auth: {
      user: 'juanmanuelpinor@gmail.com', // tu correo
      pass: 'ccsi xdek bcah semn' // tu contraseña o app password
  }
});

module.exports = Transporter