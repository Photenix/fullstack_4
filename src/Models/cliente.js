const mongoose = require('mongoose');

const clienteSchema = new mongoose.Schema({
  nombreCompleto: { type: String, required: true },
  direccion: { type: String, required: true },
  ciudad: { type: String, required: true },
  telefono: { type: String, required: true },
  email: { type: String, required: true, unique: true },  // Correo electrónico único
  documentoIdentidad: { 
    tipo: { 
      type: String, 
      enum: ['CC', 'DPI', 'Pasaporte', 'TI', 'CE'], 
      required: true 
    }, 
    numero: { type: String, required: true, unique: true }  // Número de documento único
  },
  pais: { type: String, required: true },
  active: { type: Boolean, default: true }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

module.exports = mongoose.model('Cliente', clienteSchema);
