// Models/ventaModel.js (limpio sin referencias a descuentos)
const mongoose = require('mongoose');
// const { validate } = require('./categoria');

const VentaSchema = new mongoose.Schema({
  cliente: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  employee: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: false,
    description: 'Empleado que realiza la venta',
    default: null
  },
  estado: { 
    type: String, 
    enum: ['pendiente', 'procesando', 'enviado', 'entregado', 'cancelado'],
    default: 'pendiente',
    description: 'Estado actual de la venta',
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
  fechaEntrega: { 
    type: Date,
    description: 'Fecha estimada de entrega'
  },
  // Eliminar el campo totalDescuento
  productos: [
    {
      productoId: { 
        type: mongoose.Schema.Types.ObjectId, 
        // ref: 'Product', 
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
      descuento:{
        type: Number,
        default: 0
      },
      precio: { 
        type: Number, 
        required: true 
      },
    }
  ],
  receiptImage: { // Nuevo campo agregado
    type: String,
    description: 'URL o ruta de la imagen del recibo'
  },
  isWeb: {
    type: Boolean,
    default: true,
    description: 'Indica si la venta se realizó a través de la web'
  },
  generalDiscount:{
    type: Number,
    default: 0,
    max: 90
  }
});

VentaSchema.pre('save', function(next) {
  if (this.estado) {
    this.estado = this.estado.toLowerCase();
  }
  next();
});

VentaSchema.pre('findOneAndUpdate', function(next) {
  const update = this.getUpdate();
  if (update.estado) {
    update.estado = update.estado.toLowerCase();
  }
  next();
});

const Venta = mongoose.model('Venta', VentaSchema);
module.exports = Venta;