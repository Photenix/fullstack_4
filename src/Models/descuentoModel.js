// Models/descuentoModel.js
const mongoose = require('mongoose');

const DescuentoSchema = new mongoose.Schema({
  productoId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Producto', 
    required: true 
  },
  tipo: { 
    type: String, 
    enum: ['temporada', 'baja_rotacion'], 
    required: true 
  },
  porcentaje: { 
    type: Number, 
    required: true,
    min: 0,
    max: 100 
  },
  fechaInicio: { 
    type: Date, 
    default: Date.now 
  },
  fechaFin: { 
    type: Date
  },
  activo: { 
    type: Boolean, 
    default: true 
  },
  descripcion: { 
    type: String 
  }
});

const Descuento = mongoose.model('Descuento', DescuentoSchema);
module.exports = Descuento;