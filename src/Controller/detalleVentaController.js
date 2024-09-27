const DetalleVenta = require('../Models/detalleVentaModel');

// Crear un nuevo DetalleVenta (Create)
const crearDetalleVenta = async (req, res) => {
  try {
    const detalleVenta = new DetalleVenta(req.body);
    await detalleVenta.save();
    res.status(201).json(detalleVenta);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Obtener todos los DetalleVenta (Read All)
const obtenerDetallesVenta = async (req, res) => {
  try {
    const detallesVenta = await DetalleVenta.find();
    res.status(200).json(detallesVenta);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Actualizar un DetalleVenta por ID (Update)
const actualizarDetalleVenta = async (req, res) => {
  try {
    const detalleVenta = await DetalleVenta.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // Retorna el documento actualizado
      runValidators: true, // Ejecuta validaciones definidas en el modelo
    });
    if (!detalleVenta) {
      return res.status(404).json({ message: 'Detalle de venta no encontrado' });
    }
    res.status(200).json(detalleVenta);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Eliminar un DetalleVenta por ID (Delete)
const eliminarDetalleVenta = async (req, res) => {
  try {
    const detalleVenta = await DetalleVenta.findByIdAndDelete(req.params.id);
    if (!detalleVenta) {
      return res.status(404).json({ message: 'Detalle de venta no encontrado' });
    }
    res.status(200).json({ message: 'Detalle de venta eliminado' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  crearDetalleVenta,
  obtenerDetallesVenta,
  actualizarDetalleVenta,
  eliminarDetalleVenta
};
