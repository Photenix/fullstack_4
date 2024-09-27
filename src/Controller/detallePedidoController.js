const DetallePedido = require('../Models/detallePedidoModel');

// Crear un nuevo DetallePedido (Create)
const crearDetallePedido = async (req, res) => {
  try {
    const detallePedido = new DetallePedido(req.body);
    await detallePedido.save();
    res.status(201).json(detallePedido);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Obtener todos los DetallePedido (Read All)
const obtenerDetallesPedido = async (req, res) => {
  try {
    const detallesPedido = await DetallePedido.find();
    res.status(200).json(detallesPedido);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// Eliminar un DetallePedido por ID (Delete)
const eliminarDetallePedido = async (req, res) => {
  try {
    const detallePedido = await DetallePedido.findByIdAndDelete(req.params.id);
    if (!detallePedido) {
      return res.status(404).json({ message: 'Detalle del pedido no encontrado' });
    }
    res.status(200).json({ message: 'Detalle del pedido eliminado' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  crearDetallePedido,
  obtenerDetallesPedido,
  eliminarDetallePedido,
};
