const mongoose = require('mongoose');

const clienteSchema = new mongoose.Schema({
  nombreCompleto: { type: String, required: true },
  direccion: { type: String, required: true },
  ciudad: { type: String, required: true },
  telefono: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  documentoIdentidad: { 
    tipo: { 
      type: String, 
      enum: ['CC', 'DPI', 'Pasaporte', 'TI', 'CE'], 
      required: true 
    }, 
    numero: { type: String, required: true, unique: true }
  },
  pais: { type: String, required: true }, 
  active: { type: Boolean, default: true }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Crear un virtual 'id' que devuelva el '_id' como string
clienteSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

// Asegurarse de que el virtual 'id' sea incluido cuando se convierte a JSON
clienteSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Cliente', clienteSchema);