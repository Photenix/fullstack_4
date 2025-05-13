const mongoose = require('mongoose');

const DetalleDevolucionSchema = new mongoose.Schema({
  devolucionId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Devolucion',
    required: true
  },
  productoId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Producto',
    required: true
  },
  nombreProducto: { 
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
  subtotal: { 
    type: Number, 
    required: true 
  },
  motivo: { 
    type: String, 
    required: true 
  },
  estado: { 
    type: String, 
    enum: ['Pendiente', 'Aprobado', 'Rechazado'],
    default: 'Pendiente'
  }
});

// Middleware para actualizar el total de la devolución cuando cambia un detalle
DetalleDevolucionSchema.pre('save', async function(next) {
  try {
    // Si el subtotal ha cambiado o es un documento nuevo
    if (this.isModified('subtotal') || this.isNew) {
      const Devolucion = mongoose.model('Devolucion');
      
      // Buscar la devolución asociada
      const devolucion = await Devolucion.findById(this.devolucionId);
      if (!devolucion) return next();
      
      // Obtener todos los detalles de esta devolución
      const DetalleDevolucion = mongoose.model('DetalleDevolucion');
      const detalles = await DetalleDevolucion.find({ 
        devolucionId: this.devolucionId,
        _id: { $ne: this._id } // Excluir el detalle actual
      });
      
      // Calcular el nuevo total
      let nuevoTotal = this.subtotal;
      detalles.forEach(detalle => {
        nuevoTotal += detalle.subtotal;
      });
      
      // Actualizar el total en la devolución
      devolucion.totalDevuelto = nuevoTotal;
      await devolucion.save();
    }
    next();
  } catch (error) {
    next(error);
  }
});

// También actualizar cuando se elimina un detalle
DetalleDevolucionSchema.post('remove', async function() {
  try {
    const Devolucion = mongoose.model('Devolucion');
    const DetalleDevolucion = mongoose.model('DetalleDevolucion');
    
    // Obtener todos los detalles restantes
    const detalles = await DetalleDevolucion.find({ 
      devolucionId: this.devolucionId 
    });
    
    // Calcular el nuevo total
    let nuevoTotal = 0;
    detalles.forEach(detalle => {
      nuevoTotal += detalle.subtotal;
    });
    
    // Actualizar el total en la devolución
    const devolucion = await Devolucion.findById(this.devolucionId);
    if (devolucion) {
      devolucion.totalDevuelto = nuevoTotal;
      await devolucion.save();
    }
  } catch (error) {
    console.error('Error al actualizar total después de eliminar:', error);
  }
});

const DetalleDevolucion = mongoose.model('DetalleDevolucion', DetalleDevolucionSchema);
module.exports = DetalleDevolucion;