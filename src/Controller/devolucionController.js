const Devolucion = require('../Models/devolucionModel');

// Crear una nueva Devolución (Create)
const crearDevolucion = async (req, res) => {
  try {
    const devolucion = new Devolucion(req.body);
    await devolucion.save();
    res.status(201).json(devolucion);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Obtener todas las Devoluciones (Read All)
const obtenerDevoluciones = async (req, res) => {
  try {
    const devoluciones = await Devolucion.find();
    res.status(200).json(devoluciones);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Actualizar una Devolución por ID (Update)
const actualizarDevolucion = async (req, res) => {
  try {
    const devolucion = await Devolucion.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // Retorna el documento actualizado
      runValidators: true, // Ejecuta validaciones definidas en el modelo
    });

    if (!devolucion) {
      return res.status(404).json({ message: 'Devolución no encontrada' });
    }

    res.status(200).json(devolucion);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Eliminar una Devolución por ID (Delete)
const eliminarDevolucion = async (req, res) => {
  try {
    const devolucion = await Devolucion.findByIdAndDelete(req.params.id);
    if (!devolucion) {
      return res.status(404).json({ message: 'Devolución no encontrada' });
    }
    res.status(200).json({ message: 'Devolución eliminada' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  crearDevolucion,
  obtenerDevoluciones,
  actualizarDevolucion,
  eliminarDevolucion,
};
