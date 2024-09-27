const mongoose = require('mongoose');

const VentaSchema = new mongoose.Schema({
  cliente: { type: String, required: true },
  productos: [
    {
      productoId: String,
      cantidad: Number,
      precio: Number
    }
  ],
  total: { type: Number, required: true },
  fecha: { type: Date, default: Date.now }
});

const Venta = mongoose.model('Venta', VentaSchema);
module.exports = Venta;