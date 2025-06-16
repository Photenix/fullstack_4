// Models/detalleVentaModel.js (limpio sin referencias a descuentos)
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
  precio: Number
 
});

const DetalleVenta = mongoose.model('DetalleVenta', DetalleVentaSchema);
module.exports = DetalleVenta;