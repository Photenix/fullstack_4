const mongoose = require('mongoose');

const DevolucionSchema = new mongoose.Schema({
  ventaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Venta', required: true },
  fecha: { type: Date, default: Date.now },
  totalDevuelto: { type: Number, required: true, default: 0 }
});

// Middleware para actualizar el total cuando cambia
DevolucionSchema.pre('save', function(next) {
  // Si es un documento nuevo, no hay nada que actualizar
  if (this.isNew) return next();
  
  // Si el totalDevuelto ha cambiado, ejecutamos la lógica
  if (this.isModified('totalDevuelto')) {
    console.log('Total devuelto actualizado:', this.totalDevuelto);
  }
  next();
});

const Devolucion = mongoose.model('Devolucion', DevolucionSchema);
module.exports = Devolucion;