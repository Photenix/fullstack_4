const DetalleDevolucion = require("../Models/detalleDevolucion")
const Devolucion = require("../Models/devolucionModel")

// Crear un nuevo detalle de devolución
const crearDetalleDevolucion = async (req, res) => {
  try {
    const { devolucionId, productoId, nombreProducto, cantidad, precio, subtotal, motivo, estado } = req.body

    // Validar que la devolución exista
    const devolucionExistente = await Devolucion.findById(devolucionId)
    if (!devolucionExistente) {
      return res.status(404).json({
        success: false,
        message: "La devolución especificada no existe",
      })
    }

    // Crear el detalle de devolución
    const nuevoDetalle = new DetalleDevolucion({
      devolucionId,
      productoId,
      nombreProducto,
      cantidad,
      precio,
      subtotal: subtotal || cantidad * precio,
      motivo,
      estado: estado || "Pendiente",
    })

    await nuevoDetalle.save()

    res.status(201).json({
      success: true,
      message: "Detalle de devolución creado exitosamente",
      detalle: nuevoDetalle,
    })
  } catch (error) {
    console.error("Error al crear detalle de devolución:", error)
    res.status(500).json({
      success: false,
      message: "Error al crear el detalle de devolución",
      error: error.message,
    })
  }
}

// Obtener todos los detalles de una devolución
const obtenerDetallesPorDevolucion = async (req, res) => {
  try {
    const detalles = await DetalleDevolucion.find({ devolucionId: req.params.devolucionId }).populate(
      "productoId",
      "nombre precio",
    )

    res.status(200).json({
      success: true,
      data: detalles,
    })
  } catch (error) {
    console.error(`Error al obtener detalles de devolución con ID ${req.params.devolucionId}:`, error)
    res.status(500).json({
      success: false,
      message: "Error al obtener los detalles de devolución",
      error: error.message,
    })
  }
}

// Actualizar un detalle de devolución
const actualizarDetalleDevolucion = async (req, res) => {
  try {
    const { estado } = req.body; // Solo permitir la actualización del estado

    const detalle = await DetalleDevolucion.findById(req.params.id);

    if (!detalle) {
      return res.status(404).json({
        success: false,
        message: "Detalle de devolución no encontrado",
      });
    }

    // Actualizar solo el estado
    if (estado) {
      detalle.estado = estado;
    }

    await detalle.save();

    res.status(200).json({
      success: true,
      message: "Estado del detalle de devolución actualizado exitosamente",
      data: detalle,
    });
  } catch (error) {
    console.error(`Error al actualizar detalle de devolución con ID ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      message: "Error al actualizar el detalle de devolución",
      error: error.message,
    });
  }
};


// Eliminar un detalle de devolución
const eliminarDetalleDevolucion = async (req, res) => {
  try {
    const detalle = await DetalleDevolucion.findByIdAndDelete(req.params.id)

    if (!detalle) {
      return res.status(404).json({
        success: false,
        message: "Detalle de devolución no encontrado",
      })
    }

    // Actualizar el total de la devolución
    const devolucion = await Devolucion.findById(detalle.devolucionId)
    if (devolucion) {
      devolucion.totalDevuelto -= detalle.subtotal
      await devolucion.save()
    }

    res.status(200).json({
      success: true,
      message: "Detalle de devolución eliminado exitosamente",
    })
  } catch (error) {
    console.error(`Error al eliminar detalle de devolución con ID ${req.params.id}:`, error)
    res.status(500).json({
      success: false,
      message: "Error al eliminar el detalle de devolución",
      error: error.message,
    })
  }
}

module.exports = {
  crearDetalleDevolucion,
  obtenerDetallesPorDevolucion,
  actualizarDetalleDevolucion,
  eliminarDetalleDevolucion,
}
