const DetalleVenta = require("../Models/detalleVentaModel")
// CORREGIDO: Importar el modelo Product correctamente
import Product from "../Models/Products.js"

// Obtener todos los detalles de venta
const obtenerDetallesVenta = async (req, res) => {
  try {
    const detalles = await DetalleVenta.find()
    res.status(200).json(detalles)
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al obtener los detalles de venta", error })
  }
}

// Obtener detalles de venta por ID de venta
const obtenerDetallesPorVenta = async (req, res) => {
  try {
    const detalles = await DetalleVenta.find({ ventaId: req.params.ventaId })
    if (!detalles.length) {
      return res.status(404).json({ success: false, message: "No se encontraron detalles para esta venta" })
    }
    res.status(200).json(detalles)
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al obtener los detalles", error })
  }
}

// AGREGADO: Obtener detalle por ID específico
const obtenerDetallePorId = async (req, res) => {
  try {
    const detalle = await DetalleVenta.findById(req.params.id)
    if (!detalle) {
      return res.status(404).json({ success: false, message: "Detalle de venta no encontrado" })
    }
    res.status(200).json(detalle)
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al obtener el detalle", error })
  }
}

// Crear un nuevo detalle de venta (en caso de que se agregen productos después de la venta)
const crearDetalleVenta = async (req, res) => {
  try {
    const { ventaId, productoId, nombreProducto, cantidad, precio } = req.body

    if (!ventaId || !productoId || !nombreProducto || !cantidad || !precio) {
      return res.status(400).json({ success: false, message: "Todos los campos son requeridos" })
    }

    // NUEVO: Descontar stock
    try {
      // Buscar el producto que contiene este detalle
      const product = await Product.findOne({ "details._id": productoId })

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Producto con detalle ID ${productoId} no encontrado`,
        })
      }

      // Encontrar el detalle específico
      const detailIndex = product.details.findIndex((d) => d._id.toString() === productoId.toString())

      if (detailIndex === -1) {
        return res.status(404).json({
          success: false,
          message: `Detalle específico no encontrado para el producto`,
        })
      }

      // Verificar stock disponible
      if (product.details[detailIndex].quantity < cantidad) {
        return res.status(400).json({
          success: false,
          message: `Stock insuficiente para ${product.name} - ${product.details[detailIndex].size}. Disponible: ${product.details[detailIndex].quantity}, Solicitado: ${cantidad}`,
        })
      }

      // Descontar stock
      product.details[detailIndex].quantity -= cantidad

      // Actualizar totalQuantity
      product.totalQuantity = product.details.reduce((total, detail) => total + detail.quantity, 0)

      // Guardar cambios
      await product.save()
    } catch (error) {
      console.error(`Error al procesar producto ${productoId}:`, error)
      return res.status(500).json({
        success: false,
        message: `Error al procesar producto: ${error.message}`,
      })
    }

    const detalleVenta = new DetalleVenta({
      ventaId,
      productoId,
      nombreProducto,
      cantidad,
      precio,
      subtotal: cantidad * precio,
    })

    await detalleVenta.save()
    res.status(201).json({ success: true, message: "Detalle de venta agregado", detalleVenta })
  } catch (error) {
    res.status(400).json({ success: false, message: "Error al crear el detalle de venta", error })
  }
}

// Actualizar un detalle de venta
const actualizarDetalleVenta = async (req, res) => {
  try {
    const detalleActual = await DetalleVenta.findById(req.params.id)

    if (!detalleActual) {
      return res.status(404).json({ success: false, message: "Detalle de venta no encontrado" })
    }

    const { cantidad: nuevaCantidad } = req.body

    // Si cambia la cantidad, actualizar stock
    if (nuevaCantidad && nuevaCantidad !== detalleActual.cantidad) {
      try {
        // Buscar el producto que contiene este detalle
        const product = await Product.findOne({ "details._id": detalleActual.productoId })

        if (product) {
          // Encontrar el detalle específico
          const detailIndex = product.details.findIndex((d) => d._id.toString() === detalleActual.productoId.toString())

          if (detailIndex !== -1) {
            const diferencia = nuevaCantidad - detalleActual.cantidad

            // Si aumenta la cantidad, verificar stock
            if (diferencia > 0 && product.details[detailIndex].quantity < diferencia) {
              return res.status(400).json({
                success: false,
                message: `Stock insuficiente. Disponible: ${product.details[detailIndex].quantity}, Adicional requerido: ${diferencia}`,
              })
            }

            // Actualizar stock (restar si aumenta, sumar si disminuye)
            product.details[detailIndex].quantity -= diferencia

            // Actualizar totalQuantity
            product.totalQuantity = product.details.reduce((total, detail) => total + detail.quantity, 0)

            // Guardar cambios
            await product.save()
          }
        }
      } catch (error) {
        console.error(`Error al actualizar stock para ${detalleActual.productoId}:`, error)
        return res.status(500).json({
          success: false,
          message: `Error al actualizar stock: ${error.message}`,
        })
      }
    }

    const detalleVenta = await DetalleVenta.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })

    res.status(200).json({ success: true, message: "Detalle de venta actualizado", detalleVenta })
  } catch (error) {
    res.status(400).json({ success: false, message: "Error al actualizar el detalle de venta", error })
  }
}

// AGREGADO: Eliminar detalle de venta
const eliminarDetalleVenta = async (req, res) => {
  try {
    const detalle = await DetalleVenta.findById(req.params.id)

    if (!detalle) {
      return res.status(404).json({ success: false, message: "Detalle de venta no encontrado" })
    }

    // Restaurar stock
    try {
      // Buscar el producto que contiene este detalle
      const product = await Product.findOne({ "details._id": detalle.productoId })

      if (product) {
        // Encontrar el detalle específico
        const detailIndex = product.details.findIndex((d) => d._id.toString() === detalle.productoId.toString())

        if (detailIndex !== -1) {
          // Restaurar stock
          product.details[detailIndex].quantity += detalle.cantidad

          // Actualizar totalQuantity
          product.totalQuantity = product.details.reduce((total, detail) => total + detail.quantity, 0)

          // Guardar cambios
          await product.save()
        }
      }
    } catch (error) {
      console.error(`Error al restaurar stock para ${detalle.productoId}:`, error)
      return res.status(500).json({
        success: false,
        message: `Error al restaurar stock: ${error.message}`,
      })
    }

    await DetalleVenta.findByIdAndDelete(req.params.id)

    res.status(200).json({ success: true, message: "Detalle de venta eliminado" })
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al eliminar el detalle de venta", error })
  }
}

module.exports = {
  obtenerDetallesVenta,
  obtenerDetallesPorVenta,
  obtenerDetallePorId, // AGREGADO: exportar la función
  crearDetalleVenta,
  actualizarDetalleVenta,
  eliminarDetalleVenta, // AGREGADO: exportar la función
}
