const mongoose = require('mongoose');

const DetallePedidoSchema = new mongoose.Schema({
  pedidoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pedido' },
  productoId: String,
  cantidad: Number,
  precio: Number
});

const DetallePedido = mongoose.model('DetallePedido', DetallePedidoSchema);
module.exports = DetallePedido;