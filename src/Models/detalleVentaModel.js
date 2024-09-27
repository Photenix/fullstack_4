const mongoose = require('mongoose');

const DetalleVentaSchema = new mongoose.Schema({
  ventaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Venta' },
  productoId: String,
  cantidad: Number,
  precio: Number
});

const DetalleVenta = mongoose.model('DetalleVenta', DetalleVentaSchema);
module.exports = DetalleVenta;