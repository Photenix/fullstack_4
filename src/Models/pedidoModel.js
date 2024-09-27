const mongoose = require('mongoose');

const PedidoSchema = new mongoose.Schema({
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

const Pedido = mongoose.model('Pedido', PedidoSchema);
module.exports = Pedido;