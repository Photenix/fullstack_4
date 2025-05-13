// Models/detalleVentaModel.js (actualizado)
const mongoose = require('mongoose');

const DetalleVentaSchema = new mongoose.Schema({
  ventaId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Venta' 
  },
  productoId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Producto' 
  },
  nombreProducto: String,
  cantidad: Number,
  precio: Number,
  descuento: {
    type: Number,
    default: 0
  },
  descuentoAplicado: {
    type: Number,
    default: 0
  },
  precioFinal: Number,
  descuentoPreconfiguradoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Descuento',
    default: null
  }
});

const DetalleVenta = mongoose.model('DetalleVenta', DetalleVentaSchema);
module.exports = DetalleVenta;