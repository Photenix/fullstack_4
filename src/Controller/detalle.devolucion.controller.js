const DetalleDevolucion = require('../Models/detalleDevolucion');
const Devolucion = require('../Models/devolucionModel');

// Crear un nuevo Detalle de Devolución
const crearDetalleDevolucion = async (req, res) => {
  try {
    const { devolucionId, productoId, nombreProducto, cantidad, precio, motivo } = req.body;

    // Validar que todos los campos requeridos estén presentes
    if (!devolucionId || !productoId || !nombreProducto || !cantidad || !precio || !motivo) {
      return res.status(400).json({ 
        success: false, 
        message: 'Todos los campos son requeridos' 
      });
    }

    // Verificar que la devolución existe
    const devolucionExistente = await Devolucion.findById(devolucionId);
    if (!devolucionExistente) {
      return res.status(404).json({ 
        success: false, 
        message: 'La devolución especificada no existe' 
      });
    }

    // Calcular el subtotal
    const subtotal = cantidad * precio;

    // Crear el detalle de devolución
    const nuevoDetalle = new DetalleDevolucion({
      devolucionId,
      productoId,
      nombreProducto,
      cantidad,
      precio,
      subtotal,
      motivo
    });

    await nuevoDetalle.save();
    // El middleware se encargará de actualizar el total en la devolución

    res.status(201).json({ 
      success: true, 
      message: 'Detalle de devolución creado exitosamente', 
      detalle: nuevoDetalle 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error al crear el detalle de devolución', 
      error: error.message 
    });
  }
};

// Obtener todos los Detalles de Devolución
//! quitar esta funcion posiblemente no sea necesaria
const obtenerDetallesDevoluciones = async (req, res) => {
  try {
    const detalles = await DetalleDevolucion.find();
    res.status(200).json({ 
      success: true, 
      detalles 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener los detalles de devoluciones', 
      error: error.message 
    });
  }
};

//! Quitar optener especifica o optener por ID o porque dos
// Obtener Detalles de una Devolución específica
const obtenerDetallesPorDevolucion = async (req, res) => {
  try {
    const devolucionId = req.params.devolucionId;
    
    // Verificar que la devolución existe
    const devolucionExistente = await Devolucion.findById(devolucionId);
    if (!devolucionExistente) {
      return res.status(404).json({ 
        success: false, 
        message: 'La devolución especificada no existe' 
      });
    }
    
    const detalles = await DetalleDevolucion.find({ devolucionId });
    
    res.status(200).json({ 
      success: true, 
      detalles 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener los detalles de la devolución', 
      error: error.message 
    });
  }
};

// Obtener un Detalle de Devolución por ID
const obtenerDetalleDevolucionPorId = async (req, res) => {
  try {
    const detalle = await DetalleDevolucion.findById(req.params.id);
    
    if (!detalle) {
      return res.status(404).json({ 
        success: false, 
        message: 'Detalle de devolución no encontrado' 
      });
    }
    
    res.status(200).json({ 
      success: true, 
      detalle 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener el detalle de devolución', 
      error: error.message 
    });
  }
};


//!quitar todo lo que tenga que ver con actualizar
// Actualizar un Detalle de Devolución
const actualizarDetalleDevolucion = async (req, res) => {
  try {
    const { cantidad, precio, motivo, estado } = req.body;
    
    // Verificar que el detalle existe
    const detalleExistente = await DetalleDevolucion.findById(req.params.id);
    if (!detalleExistente) {
      return res.status(404).json({ 
        success: false, 
        message: 'Detalle de devolución no encontrado' 
      });
    }
    
    // Preparar los datos a actualizar
    const datosActualizados = {
      motivo: motivo || detalleExistente.motivo,
      estado: estado || detalleExistente.estado
    };
    
    // Si se actualizan cantidad o precio, recalcular el subtotal
    if (cantidad || precio) {
      datosActualizados.cantidad = cantidad || detalleExistente.cantidad;
      datosActualizados.precio = precio || detalleExistente.precio;
      datosActualizados.subtotal = datosActualizados.cantidad * datosActualizados.precio;
    }
    
    const detalleActualizado = await DetalleDevolucion.findByIdAndUpdate(
      req.params.id,
      datosActualizados,
      { new: true, runValidators: true }
    );
    
    // El middleware se encargará de actualizar el total en la devolución
    
    res.status(200).json({ 
      success: true, 
      message: 'Detalle de devolución actualizado exitosamente', 
      detalle: detalleActualizado 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error al actualizar el detalle de devolución', 
      error: error.message 
    });
  }
};

// Eliminar un Detalle de Devolución
const eliminarDetalleDevolucion = async (req, res) => {
  try {
    const detalle = await DetalleDevolucion.findById(req.params.id);
    
    if (!detalle) {
      return res.status(404).json({
        success: false,
        message: 'Detalle de devolución no encontrado'
      });
    }
    
    // Usar remove() para que se active el middleware post-remove
    await detalle.remove();
    
    res.status(200).json({
      success: true,
      message: 'Detalle de devolución eliminado exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar el detalle de devolución',
      error: error.message
    });
  }
};

// Procesar Devolución (convertir a nueva venta)
//! Si de aqui se va a crear una venta usar el modelo de ventas, sino cambiar el comentario ya que es confuso
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
    
    // Verificar que el detalle existe
    const detalle = await DetalleDevolucion.findById(id);
    if (!detalle) {
      return res.status(404).json({ 
        success: false, 
        message: 'Detalle de devolución no encontrado' 
      });
    }
    
    // No permitir procesar devoluciones ya procesadas
    if (detalle.estado !== 'Pendiente') {
      return res.status(400).json({
        success: false,
        message: `Esta devolución ya ha sido ${detalle.estado.toLowerCase()}`
      });
    }
    
    // Actualizar el estado según la acción
    detalle.estado = accion === 'aprobar' ? 'Aprobado' : 'Rechazado';
    await detalle.save();
    
    // Si se aprueba, aquí iría la lógica para crear una nueva venta o registro
    // Esta parte dependerá de tu lógica de negocio específica
    
    let mensaje = '';
    if (accion === 'aprobar') {
      mensaje = 'Devolución aprobada y procesada como nueva venta';
      // Aquí iría el código para crear la nueva venta
    } else {
      mensaje = 'Devolución rechazada';
    }
    
    res.status(200).json({
      success: true,
      message: mensaje,
      detalle
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error al procesar la devolución', 
      error: error.message 
    });
  }
};

module.exports = {
  crearDetalleDevolucion,
  obtenerDetallesDevoluciones,
  obtenerDetallesPorDevolucion,
  obtenerDetalleDevolucionPorId,
  actualizarDetalleDevolucion,
  eliminarDetalleDevolucion,
  procesarDevolucion
};