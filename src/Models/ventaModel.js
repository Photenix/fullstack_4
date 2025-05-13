// Models/ventaModel.js (actualizado)
const mongoose = require('mongoose');

const VentaSchema = new mongoose.Schema({
  cliente: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', // Cambiado de 'Cliente' a 'User' según tu comentario
    required: true 
  },
  estado: { 
    type: String, 
    enum: ['Pendiente', 'Procesando', 'Enviado', 'Entregado', 'Cancelado'],
    default: 'Pendiente',
    description: 'Estado actual de la venta'
  },
  fecha: { 
    type: Date, 
    default: Date.now 
  },
  direccion: { 
    type: String, 
    required: true 
  },
  ciudad: { 
    type: String, 
    required: true,
    description: 'Ciudad donde se realizará la entrega'
  },
  total: { 
    type: Number, 
    required: true 
  },
  totalDescuento: {
    type: Number,
    default: 0
  },
  productos: [
    {
      productoId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Producto', 
        required: true 
      },
      nombre: {
        type: String,
        required: true
      },
      cantidad: { 
        type: Number, 
        required: true 
      },
      precio: { 
        type: Number, 
        required: true 
      },
      descuento: {
        type: Number,
        default: 0
      },
      descuentoAplicado: {
        type: Number,
        default: 0
      },
      precioFinal: {
        type: Number,
        required: true
      },
      descuentoPreconfiguradoId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Descuento',
        default: null
      }
    }
  ]
});

const Venta = mongoose.model('Venta', VentaSchema);
module.exports = Venta;