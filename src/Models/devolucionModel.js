const mongoose = require('mongoose');

const DevolucionSchema = new mongoose.Schema({
  ventaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Venta' },
  productoId: String,
  cantidad: Number,
  motivo: String,
  fecha: { type: Date, default: Date.now }
});

const Devolucion = mongoose.model('Devolucion', DevolucionSchema);
module.exports = Devolucion;