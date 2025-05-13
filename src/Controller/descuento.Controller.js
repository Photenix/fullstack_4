// Controller/descuentoController.js
const Descuento = require('../Models/descuentoModel');

// Obtener todos los descuentos
const obtenerDescuentos = async (req, res) => {
  try {
    const descuentos = await Descuento.find().populate('productoId');
    res.status(200).json(descuentos);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener los descuentos', error });
  }
};

// Obtener descuentos por producto
const obtenerDescuentosPorProducto = async (req, res) => {
  try {
    const { productoId } = req.params;
    
    // Obtener descuentos activos para el producto
    const descuentos = await Descuento.find({ 
      productoId, 
      activo: true,
      $or: [
        { fechaFin: { $exists: false } },
        { fechaFin: null },
        { fechaFin: { $gte: new Date() } }
      ]
    });
    
    res.status(200).json(descuentos);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener los descuentos del producto', error });
  }
};

// Crear un nuevo descuento
const crearDescuento = async (req, res) => {
  try {
    const { productoId, tipo, porcentaje, fechaInicio, fechaFin, descripcion } = req.body;
    
    // Validar campos requeridos
    if (!productoId || !tipo || porcentaje === undefined) {
      return res.status(400).json({ success: false, message: 'Producto, tipo y porcentaje son campos requeridos' });
    }
    
    // Crear el descuento
    const nuevoDescuento = new Descuento({
      productoId,
      tipo,
      porcentaje,
      fechaInicio: fechaInicio || Date.now(),
      fechaFin,
      descripcion,
      activo: true
    });
    
    await nuevoDescuento.save();
    
    res.status(201).json({ success: true, message: 'Descuento creado exitosamente', descuento: nuevoDescuento });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al crear el descuento', error });
  }
};

// Actualizar un descuento
const actualizarDescuento = async (req, res) => {
  try {
    const { id } = req.params;
    const { tipo, porcentaje, fechaInicio, fechaFin, activo, descripcion } = req.body;
    
    // Verificar si el descuento existe
    const descuento = await Descuento.findById(id);
    if (!descuento) {
      return res.status(404).json({ success: false, message: 'Descuento no encontrado' });
    }
    
    // Actualizar campos
    if (tipo) descuento.tipo = tipo;
    if (porcentaje !== undefined) descuento.porcentaje = porcentaje;
    if (fechaInicio) descuento.fechaInicio = fechaInicio;
    if (fechaFin) descuento.fechaFin = fechaFin;
    if (activo !== undefined) descuento.activo = activo;
    if (descripcion) descuento.descripcion = descripcion;
    
    await descuento.save();
    
    res.status(200).json({ success: true, message: 'Descuento actualizado exitosamente', descuento });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al actualizar el descuento', error });
  }
};

// Eliminar un descuento
const eliminarDescuento = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar si el descuento existe
    const descuento = await Descuento.findById(id);
    if (!descuento) {
      return res.status(404).json({ success: false, message: 'Descuento no encontrado' });
    }
    
    await Descuento.findByIdAndDelete(id);
    
    res.status(200).json({ success: true, message: 'Descuento eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al eliminar el descuento', error });
  }
};

module.exports = {
  obtenerDescuentos,
  obtenerDescuentosPorProducto,
  crearDescuento,
  actualizarDescuento,
  eliminarDescuento
};