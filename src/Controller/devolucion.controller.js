const Devolucion = require('../Models/devolucionModel');
const DetalleDevolucion = require('../Models/detalleDevolucion');
const Venta = require('../Models/ventaModel');

// Crear una nueva Devolución (Create)
const crearDevolucion = async (req, res) => {
  try {
    const { ventaId } = req.body;
    
    if (!ventaId) {
      return res.status(400).json({ message: 'El ID de venta es requerido' });
    }
    
    // Verificar que la venta existe
    const ventaExistente = await Venta.findById(ventaId);
    if (!ventaExistente) {
      return res.status(404).json({ message: 'La venta especificada no existe' });
    }
    
    const devolucion = new Devolucion({
      ventaId,
      totalDevuelto: 0 // Inicialmente en cero, se actualizará con los detalles
    });
    
    await devolucion.save();
    //! Una venta tiene que cambiar de estado cuando la devolución se crea
    res.status(201).json(devolucion);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Obtener todas las Devoluciones (Read All)
const obtenerDevoluciones = async (req, res) => {
  try {
    //! colocar limitación de objetos que puede traer
    const devoluciones = await Devolucion.find().sort({ fecha: -1 });
    res.status(200).json(devoluciones);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtener una Devolución por ID con sus detalles
const obtenerDevolucionPorId = async (req, res) => {
  try {
    const devolucion = await Devolucion.findById(req.params.id);
    
    if (!devolucion) {
      return res.status(404).json({ message: 'Devolución no encontrada' });
    }
    
    // Obtener los detalles asociados
    const detalles = await DetalleDevolucion.find({ devolucionId: devolucion._id });
    
    res.status(200).json({
      devolucion,
      detalles
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Procesar una Devolución (aprobar o rechazar)
const procesarDevolucion = async (req, res) => {
  try {
    const { id } = req.params;
    const { accion } = req.body; // 'aprobar' o 'rechazar'
    
    if (!accion || (accion !== 'aprobar' && accion !== 'rechazar')) {
      return res.status(400).json({
        success: false,
        message: 'Debe especificar una acción válida (aprobar o rechazar)'
      });
    }
    
    // Verificar que la devolución existe
    const devolucion = await Devolucion.findById(id);
    if (!devolucion) {
      return res.status(404).json({ 
        success: false, 
        message: 'Devolución no encontrada' 
      });
    }
    
    // Obtener la venta original
    const ventaOriginal = await Venta.findById(devolucion.ventaId);
    if (!ventaOriginal) {
      return res.status(404).json({
        success: false,
        message: 'Venta original no encontrada'
      });
    }
    
    // Obtener todos los detalles de esta devolución
    const detallesDevolucion = await DetalleDevolucion.find({ devolucionId: devolucion._id });
    
    if (accion === 'aprobar') {
      // Actualizar el estado de todos los detalles a "Aprobado"
      for (const detalle of detallesDevolucion) {
        detalle.estado = 'Aprobado';
        await detalle.save();
      }
      
      // Identificar qué productos se devolvieron
      const productosDevueltos = detallesDevolucion.map(detalle => ({
        productoId: detalle.productoId.toString(),
        cantidad: detalle.cantidad
      }));
      
      // Identificar qué productos quedan (no se devolvieron o se devolvieron parcialmente)
      const productosRestantes = [];
      
      for (const productoOriginal of ventaOriginal.productos) {
        const productoDevuelto = productosDevueltos.find(
          p => p.productoId === productoOriginal.productoId.toString()
        );
        
        // Si el producto no se devolvió o se devolvieron algunos
        if (!productoDevuelto || productoDevuelto.cantidad < productoOriginal.cantidad) {
          const cantidadRestante = productoDevuelto 
            ? productoOriginal.cantidad - productoDevuelto.cantidad 
            : productoOriginal.cantidad;
            
          if (cantidadRestante > 0) {
            productosRestantes.push({
              productoId: productoOriginal.productoId,
              cantidad: cantidadRestante,
              precio: productoOriginal.precio
            });
          }
        }
      }
      
      // Si quedan productos, crear una nueva venta
      if (productosRestantes.length > 0) {
        // Calcular el total de la nueva venta
        const totalNuevaVenta = productosRestantes.reduce(
          (sum, prod) => sum + (prod.cantidad * prod.precio), 0
        );
        
        // Crear la nueva venta con los productos restantes
        const nuevaVenta = new Venta({
          cliente: ventaOriginal.cliente,
          estado: 'Procesando',
          fecha: new Date(),
          direccion: ventaOriginal.direccion,
          ciudad: ventaOriginal.ciudad,
          total: totalNuevaVenta,
          productos: productosRestantes
        });
        
        await nuevaVenta.save();
        
        res.status(200).json({
          success: true,
          message: 'Devolución aprobada. Se ha creado una nueva venta.',
          devolucion,
          nuevaVenta
        });
      } else {
        // Si no quedan productos (todos fueron devueltos)
        res.status(200).json({
          success: true,
          message: 'Devolución aprobada. Todos los productos fueron devueltos.',
          devolucion
        });
      }
    } else {
      // Si se rechaza la devolución
      // Actualizar el estado de todos los detalles a "Rechazado"
      for (const detalle of detallesDevolucion) {
        detalle.estado = 'Rechazado';
        await detalle.save();
      }
      
      res.status(200).json({
        success: true,
        message: 'Devolución rechazada',
        devolucion
      });
    }
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error al procesar la devolución', 
      error: error.message 
    });
  }
};

// Eliminar una Devolución por ID (Delete)
const eliminarDevolucion = async (req, res) => {
  try {
    // Primero eliminar todos los detalles asociados
    await DetalleDevolucion.deleteMany({ devolucionId: req.params.id });
    
    // Luego eliminar la devolución
    const devolucion = await Devolucion.findByIdAndDelete(req.params.id);
    
    if (!devolucion) {
      return res.status(404).json({ message: 'Devolución no encontrada' });
    }
    
    res.status(200).json({ message: 'Devolución y sus detalles eliminados' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  crearDevolucion,
  obtenerDevoluciones,
  obtenerDevolucionPorId,
  procesarDevolucion,
  eliminarDevolucion,
};