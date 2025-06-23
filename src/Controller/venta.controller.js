// Controllers/ventaController.js
const Venta = require("../Models/ventaModel")
const DetalleVenta = require("../Models/detalleVentaModel")
// CORREGIDO: Importar el modelo Product correctamente (ajusta la ruta según tu estructura)
import Product from "../Models/Products.js"

// Crear una nueva Venta
const crearVenta = async (req, res) => {
  try {
    const employeeId = req?.user._id || null;
    
    // Eliminar totalDescuento de la desestructuración
    const { cliente, productos, estado, fecha, direccion, ciudad, total } = req.body

    // console.log("Datos recibidos:", { cliente, productos, estado, direccion, ciudad, total })

    if (!cliente || !productos || !direccion || !ciudad) {
      console.log("Validación fallida:", { cliente, direccion, ciudad, total })
      return res.status(400).json({ success: false, message: "Todos los campos son requeridos" })
    }

    // NUEVO: Descontar stock antes de crear la venta
    for (const item of productos) {
      try {
        // Buscar el producto que contiene este detalle
        const product = await Product.findOne({ $or: [
          { _id: item.productoId }, { "details._id": item.productoId }
        ] })

        if (!product) {
          return res.status(404).json({
            success: false,
            message: `Producto con detalle ID ${item.productoId} no encontrado`,
          })
        }

        // Encontrar el detalle específico
        const detailIndex = product.details.findIndex((d) => d._id.toString() === item.productoId.toString())

        if (detailIndex === -1) {
          return res.status(404).json({
            success: false,
            message: `Detalle específico no encontrado para el producto`,
          })
        }

        // Verificar stock disponible
        if (product.details[detailIndex].quantity < item.cantidad) {
          return res.status(400).json({
            success: false,
            message: `Stock insuficiente para ${product.name} - ${product.details[detailIndex].size}. Disponible: ${product.details[detailIndex].quantity}, Solicitado: ${item.cantidad}`,
          })
        }

        // Descontar stock
        product.details[detailIndex].quantity -= item.cantidad

        // Actualizar totalQuantity
        product.totalQuantity = product.details.reduce((total, detail) => total + detail.quantity, 0)

        // Guardar cambios
        await product.save()

        console.log(
          `Stock descontado para ${product.name} - ${product.details[detailIndex].size}: ${item.cantidad} unidades`,
        )
      } catch (error) {
        console.error(`Error al procesar producto ${item.productoId}:`, error)
        return res.status(500).json({
          success: false,
          message: `Error al procesar producto: ${error.message}`,
        })
      }
    }

    const nuevaVenta = new Venta({
      cliente,
      estado: estado || "pendiente",
      fecha: fecha || Date.now(),
      fechaEntrega: req.body?.fechaEntrega || Date.now(),
      direccion,
      ciudad,
      total,
      productos: productos.map((producto) => ({
        productoId: producto.productoId,
        nombre: producto.nombre,
        cantidad: producto.cantidad,
        precio: producto.precio,
        descuento: producto.descuento || 0
      })),
      isWeb: req.body?.isWeb || false, // AGREGADO: isWeb
      generalDiscount: req.body?.generalDiscount || 0,
      employee: employeeId
    })

    // console.log("Intentando guardar venta")
    const ventaGuardada = await nuevaVenta.save()
    // console.log("Venta guardada:", ventaGuardada._id)

    const detalles = productos.map((producto) => ({
      ventaId: nuevaVenta._id,
      productoId: producto.productoId,
      nombreProducto: producto.nombre,
      cantidad: producto.cantidad,
      precio: producto.precio,
      descuento: producto.descuento || 0
    }))

    await DetalleVenta.insertMany(detalles)

    res.status(201).json({ success: true, message: "Venta creada exitosamente", venta: ventaGuardada, detalles })
  } catch (error) {
    console.log("Error al crear venta:", error)

    res.status(500).json({ success: false, message: "Error al crear la venta", error: error.toString() })
  }
}

const obtenerVentas = async (req, res) => {
  try {
    const limit = req.query.limit || 100 // I put 100 if maybe don't used the funcionality
    const page = req.query.page || 1
    const offset = (page - 1)  * limit
    const ventas = await Venta.find()
      .sort({ fecha: -1 })
      .skip(offset)
      .limit(limit)
      .populate('cliente', 'firstName lastName')
      .populate('employee', 'firstName lastName')

    res.status(200).json(ventas)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

const obtenerVenta = async (req, res) => {
  try {
    const venta = await Venta
      .findById(req.params.id)
      .populate('cliente', 'firstName lastName')
      .populate('employee', 'firstName lastName')
      .lean()
    if (!venta) {
      return res.status(404).json({ success: false, message: 'Venta no encontrada' });
    }
    res.status(200).json({
      ...venta
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener la venta', error: error.message });
  }
};


// CORREGIDO: Usar { estado } en lugar de { estadoLower }
const actualizarEstadoVenta = async (req, res) => {
  try {
    const { id } = req.params
    const { estado } = req.body

    const estadoLower = estado.toLowerCase()

    if (!estadoLower) {
      return res.status(400).json({ success: false, message: "El estado es requerido" })
    }

    const venta = await Venta.findByIdAndUpdate(
      id,
      { estado: estadoLower }, // CORREGIDO: era { estadoLower }
      { new: true, runValidators: true },
    )

    if (!venta) {
      return res.status(404).json({ success: false, message: "Venta no encontrada" })
    }

    res.status(200).json({ success: true, message: "Estado de venta actualizado", venta })
  } catch (error) {
    console.log(error)
    res.status(500).json({ success: false, message: "Error al actualizar el estado de la venta", error })
  }
}

const getSellByUser = async (req, res) => {
  try{
    const { user } = req
    if (!user) return res.status(401).json({ message: "No hay usuario logueado" })
    const realUser = await Venta.find({ cliente: user._id }).sort({ fecha: -1 }).lean()
    console.log(user._id)
    console.log(realUser)
    if (!realUser) return res.status(404).json({ message: "No se encontró el usuario", success: false })
    return res.json(realUser)
  }
  catch (error) {
    console.error("Error al obtener ventas por usuario:", error)
    return res.status(500).json({ message: "Error al obtener ventas por usuario", success: false, error: error.message })
  }
}

// AGREGADO: Función que estaba en detalleVentaController
const obtenerVentasClienteId = async (req, res) => {
  try {
    const { clienteId } = req.params

    if (!clienteId) {
      return res.status(400).json({
        success: false,
        message: "ID de cliente no proporcionado",
      })
    }

    // Buscar ventas donde el cliente coincida con el ID proporcionado
    const ventas = await Venta.find({ cliente: clienteId }).populate("cliente").populate("productos.productoId")

    console.log(`Ventas encontradas para el cliente ${clienteId}:`, ventas.length)

    res.status(200).json(ventas)
  } catch (error) {
    console.error(`Error al obtener ventas para el cliente ${req.params.clienteId}:`, error)
    res.status(500).json({
      success: false,
      message: "Error al obtener ventas del cliente",
      error: error.message,
    })
  }
}

module.exports = {
  crearVenta,
  obtenerVentas,
  actualizarEstadoVenta,
  obtenerVenta,
  getSellByUser,
  obtenerVentasClienteId, // AGREGADO: exportar la función
}
