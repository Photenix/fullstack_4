const mongoose = require('mongoose');

const clienteSchema = new mongoose.Schema({
  nombreCompleto: { type: String, required: true },
  direccion: { type: String, required: true },
  ciudad: { type: String, required: true },
  telefono: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  estado: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Cliente', clienteSchema);