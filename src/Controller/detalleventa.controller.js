const DetalleVenta = require('../Models/detalleVentaModel');

// Obtener todos los detalles de venta
const obtenerDetallesVenta = async (req, res) => {
  try {
    const detalles = await DetalleVenta.find();
    res.status(200).json(detalles);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener los detalles de venta', error });
  }
};

// Obtener detalles de venta por ID de venta
const obtenerDetallesPorVenta = async (req, res) => {
  try {
    const detalles = await DetalleVenta.find({ ventaId: req.params.ventaId });
    if (!detalles.length) {
      return res.status(404).json({ success: false, message: 'No se encontraron detalles para esta venta' });
    }
    res.status(200).json(detalles);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener los detalles', error });
  }
};

// Crear un nuevo detalle de venta (en caso de que se agregen productos después de la venta)
const crearDetalleVenta = async (req, res) => {
  try {
    const { ventaId, nombreProducto, cantidad, precio } = req.body;

    if (!ventaId || !nombreProducto || !cantidad || !precio) {
      return res.status(400).json({ success: false, message: 'Todos los campos son requeridos' });
    }

    const detalleVenta = new DetalleVenta({
      ventaId,
      nombreProducto,
      cantidad,
      precio,
      subtotal: cantidad * precio
    });

    await detalleVenta.save();
    res.status(201).json({ success: true, message: 'Detalle de venta agregado', detalleVenta });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Error al crear el detalle de venta', error });
  }
};

// Actualizar un detalle de venta
const actualizarDetalleVenta = async (req, res) => {
  try {
    const detalleVenta = await DetalleVenta.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!detalleVenta) {
      return res.status(404).json({ success: false, message: 'Detalle de venta no encontrado' });
    }

    res.status(200).json({ success: true, message: 'Detalle de venta actualizado', detalleVenta });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Error al actualizar el detalle de venta', error });
  }
};

module.exports = {
  obtenerDetallesVenta,
  obtenerDetallesPorVenta,
  crearDetalleVenta,
  actualizarDetalleVenta
};