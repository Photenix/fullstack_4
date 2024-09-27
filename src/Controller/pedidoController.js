const Pedido = require('../Models/pedidoModel');

// Crear un nuevo Pedido (Create)
const crearPedido = async (req, res) => {
  try {
    const { producto } = req.body;

    if (producto.length <= 0) {
      return res.status(400).json({ message: "Error al crear pedido, necesitas ingresar un producto" });
    }

    const pedido = new Pedido(req.body);
    await pedido.save();
    res.status(201).json(pedido);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Obtener todos los Pedidos (Read All)
const obtenerPedidos = async (req, res) => {
  try {
    const pedidos = await Pedido.find();
    res.status(200).json(pedidos);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


// Actualizar un Pedido por ID (Update)
const actualizarPedido = async (req, res) => {
  try {
    const { producto } = req.body;

    if (producto.length <= 0) {
      return res.status(400).json({ message: "Error al actualizar pedido, necesitas ingresar un producto" });
    }

    const pedido = await Pedido.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // Retorna el documento actualizado
      runValidators: true, // Ejecuta validaciones definidas en el modelo
    });

    if (!pedido) {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }

    res.status(200).json(pedido);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Eliminar un Pedido por ID (Delete)
const eliminarPedido = async (req, res) => {
  try {
    const pedido = await Pedido.findByIdAndDelete(req.params.id);
    if (!pedido) {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }
    res.status(200).json({ message: 'Pedido eliminado' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  crearPedido,
  obtenerPedidos,
  actualizarPedido,
  eliminarPedido
};
