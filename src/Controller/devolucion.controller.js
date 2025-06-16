const Devolucion = require("../Models/devolucionModel")
const Venta = require("../Models/ventaModel")
// Corregir la importación del modelo de productos
const Product = require("../Models/Products").default // Añadido .default para importar el default export

// IMPORTAR EL MODELO CORRECTO - usando el esquema existente
const DetalleDevolucion = require("../Models/detalleDevolucion")

// IMPORTAR EL NUEVO SERVICIO
const DevolucionService = require("../services/devolucionService")

// Crear una nueva devolución
const crearDevolucion = async (req, res) => {
  try {
    const { ventaId, productosDevueltos, motivo, totalDevuelto, fecha, estado } = req.body

    // console.log("Datos recibidos para devolución:", { ventaId, productosDevueltos, motivo, totalDevuelto })

    // Validaciones básicas
    if (!ventaId) {
      return res.status(400).json({
        success: false,
        message: "Se requiere ID de venta",
      })
    }

    // Si se proporcionan productos específicos, usar la lógica completa
    if (productosDevueltos && Array.isArray(productosDevueltos) && productosDevueltos.length > 0) {
      return await procesarDevolucionCompleta(req, res)
    }

    // Si solo se proporciona el total (lógica simple existente)
    const ventaExistente = await Venta.findById(ventaId)
    if (!ventaExistente) {
      return res.status(404).json({
        success: false,
        message: "La venta especificada no existe",
      })
    }

    const nuevaDevolucion = new Devolucion({
      ventaId,
      totalDevuelto: totalDevuelto || 0,
      estado: estado || "Pendiente",
    })

    // console.log( estado );

    await nuevaDevolucion.save()

    res.status(201).json({
      success: true,
      message: "Devolución creada exitosamente",
      // devolucion: nuevaDevolucion,
    })
  } catch (error) {
    console.error("Error al crear devolución:", error)
    res.status(500).json({
      success: false,
      message: "Error al crear la devolución",
      error: error.message,
    })
  }
}

// FUNCIÓN ACTUALIZADA PARA USAR EL SERVICIO
const procesarDevolucionCompleta = async (req, res) => {
  try {
    const { ventaId, productosDevueltos, motivo } = req.body

    // Verificar que la venta existe
    const ventaOriginal = await Venta.findById(ventaId)
    if (!ventaOriginal) {
      return res.status(404).json({
        success: false,
        message: "Venta no encontrada",
      })
    }

    // Verificar que la venta no esté ya cancelada
    if (ventaOriginal.estado === "cancelado") {
      return res.status(400).json({
        success: false,
        message: "No se puede procesar devolución de una venta cancelada",
      })
    }

    // Validar productos a devolver
    const validacionProductos = validarProductosBasico(ventaOriginal.productos, productosDevueltos)

    if (!validacionProductos.esValido) {
      return res.status(400).json({
        success: false,
        message: validacionProductos.mensaje,
      })
    }

    // Calcular total devuelto
    const totalDevuelto = productosDevueltos.reduce((total, producto) => {
      return total + producto.cantidad * producto.precio
    }, 0)

    // Crear la devolución
    const nuevaDevolucion = new Devolucion({
      ventaId,
      fecha: new Date(),
      totalDevuelto,
      estado: "Pendiente",
    })

    const devolucionGuardada = await nuevaDevolucion.save()

    // PROCESAR LA DEVOLUCIÓN USANDO EL SERVICIO
    const resultadoProcesamiento = await DevolucionService.procesarDevolucion(
      ventaOriginal,
      productosDevueltos,
      devolucionGuardada._id
    )

    // Actualizar estado de la devolución
    devolucionGuardada.estado = "Aprobado"
    await devolucionGuardada.save()

    // Crear detalles de devolución usando los nombres de campos correctos del esquema
    const detallesDevolucion = productosDevueltos.map((producto) => ({
      devolucionId: devolucionGuardada._id, // Usar devolucionId como está en el esquema
      productoId: producto.productoId, // Usar productoId como está en el esquema
      nombreProducto: producto.nombre, // Usar nombreProducto como está en el esquema
      cantidad: producto.cantidad,
      precio: producto.precio, // Usar precio como está en el esquema
      subtotal: producto.cantidad * producto.precio,
      motivo: producto.motivo || motivo || "No especificado",
      estado: "Aprobado",
    }))

    await DetalleDevolucion.insertMany(detallesDevolucion)

    res.status(201).json({
      success: true,
      message: "Devolución procesada exitosamente",
      devolucion: devolucionGuardada,
      detalles: detallesDevolucion,
      ventaCancelada: resultadoProcesamiento.ventaCancelada,
      nuevaVenta: resultadoProcesamiento.nuevaVenta,
      stockActualizado: resultadoProcesamiento.stockActualizado,
    })
  } catch (error) {
    console.error("Error al procesar devolución completa:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor al procesar devolución",
      error: error.message,
    })
  }
}

// Función de validación básica sin dependencias externas
function validarProductosBasico(productosVenta, productosDevueltos) {
  try {
    for (const productoDevuelto of productosDevueltos) {
      // Buscar el producto en la venta original
      const productoEnVenta = productosVenta.find(
        (p) => p.productoId.toString() === productoDevuelto.productoId.toString(),
      )

      if (!productoEnVenta) {
        return {
          esValido: false,
          mensaje: `El producto ${productoDevuelto.nombre} no está en la venta original`,
        }
      }

      // Verificar que no se devuelva más cantidad de la comprada
      if (productoDevuelto.cantidad > productoEnVenta.cantidad) {
        return {
          esValido: false,
          mensaje: `No se puede devolver más cantidad de ${productoDevuelto.nombre} de la que se compró`,
        }
      }

      // Verificar que la cantidad sea positiva
      if (productoDevuelto.cantidad <= 0) {
        return {
          esValido: false,
          mensaje: `La cantidad a devolver de ${productoDevuelto.nombre} debe ser mayor a 0`,
        }
      }
    }

    return { esValido: true }
  } catch (error) {
    console.error("Error en validación de productos:", error)
    return {
      esValido: false,
      mensaje: "Error interno en la validación de productos",
    }
  }
}

// Función básica para procesar devolución sin servicios externos
const procesarDevolucionBasica = async (req, res) => {
  try {
    const { ventaId, productosDevueltos, motivo } = req.body

    // Verificar que la venta existe
    const ventaOriginal = await Venta.findById(ventaId)
    if (!ventaOriginal) {
      return res.status(404).json({
        success: false,
        message: "Venta no encontrada",
      })
    }

    // Calcular total devuelto
    const totalDevuelto = productosDevueltos.reduce((total, producto) => {
      return total + producto.cantidad * producto.precio
    }, 0)

    // Crear la devolución
    const nuevaDevolucion = new Devolucion({
      ventaId,
      fecha: new Date(),
      totalDevuelto,
      estado: "Pendiente",
    })

    const devolucionGuardada = await nuevaDevolucion.save()

    // Solo cancelar la venta (lógica básica)
    await Venta.findByIdAndUpdate(ventaId, { estado: "cancelado" })

    res.status(201).json({
      success: true,
      message: "Devolución procesada exitosamente (modo básico)",
      devolucion: devolucionGuardada,
      ventaCancelada: { _id: ventaId, estado: "cancelado" },
      nota: "Procesado en modo básico - solo se canceló la venta original",
    })
  } catch (error) {
    console.error("Error al procesar devolución básica:", error)
    res.status(500).json({
      success: false,
      message: "Error al procesar devolución",
      error: error.message,
    })
  }
}

// Obtener todas las devoluciones con paginación y filtros
const obtenerDevoluciones = async (req, res) => {
  try {
    const { page = 1, limit = 10, searchTerm = "" } = req.query
    const skip = (page - 1) * limit

    // Construir filtro de búsqueda
    const filtro = {}
    if (searchTerm) {
      // Si searchTerm es un ObjectId válido, buscar por ventaId
      if (searchTerm.match(/^[0-9a-fA-F]{24}$/)) {
        filtro.ventaId = searchTerm
      }
    }

    // Obtener devoluciones con paginación
    const devoluciones = await Devolucion.find(filtro)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number.parseInt(limit))
      .populate("ventaId", "cliente fecha total")

    // Contar total de documentos para paginación
    const total = await Devolucion.countDocuments(filtro)

    res.status(200).json({
      success: true,
      returns: devoluciones,
      devoluciones: devoluciones,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: Number.parseInt(page),
    })
  } catch (error) {
    console.error("Error al obtener devoluciones:", error)
    res.status(500).json({
      success: false,
      message: "Error al obtener las devoluciones",
      error: error.message,
    })
  }
}

// Obtener una devolución por ID
const obtenerDevolucionPorId = async (req, res) => {
  try {
    const devolucion = await Devolucion.findById(req.params.id).populate("ventaId", "cliente fecha total")

    if (!devolucion) {
      return res.status(404).json({
        success: false,
        message: "Devolución no encontrada",
      })
    }

    res.status(200).json({
      success: true,
      data: devolucion,
      devolucion: devolucion,
    })
  } catch (error) {
    console.error(`Error al obtener devolución con ID ${req.params.id}:`, error)
    res.status(500).json({
      success: false,
      message: "Error al obtener la devolución",
      error: error.message,
    })
  }
}

// Obtener devoluciones por venta
const obtenerDevolucionesPorVenta = async (req, res) => {
  try {
    const { ventaId } = req.params

    const devoluciones = await Devolucion.find({ ventaId }).sort({ fecha: -1 })

    res.status(200).json({
      success: true,
      devoluciones,
    })
  } catch (error) {
    console.error("Error al obtener devoluciones por venta:", error)
    res.status(500).json({
      success: false,
      message: "Error al obtener devoluciones de la venta",
      error: error.message,
    })
  }
}

// Actualizar una devolución
const actualizarDevolucion = async (req, res) => {
  try {
    const { estado } = req.body

    const devolucion = await Devolucion.findByIdAndUpdate(req.params.id, { estado }, { new: true, runValidators: true })

    if (!devolucion) {
      return res.status(404).json({
        success: false,
        message: "Devolución no encontrada",
      })
    }

    res.status(200).json({
      success: true,
      message: "Devolución actualizada exitosamente",
      data: devolucion,
      devolucion: devolucion,
    })
  } catch (error) {
    console.error(`Error al actualizar devolución con ID ${req.params.id}:`, error)
    res.status(500).json({
      success: false,
      message: "Error al actualizar la devolución",
      error: error.message,
    })
  }
}

// Actualizar estado de devolución
const actualizarEstadoDevolucion = async (req, res) => {
  try {
    const { id } = req.params
    const { estado } = req.body

    if (!["Pendiente", "Aprobado", "Rechazado"].includes(estado)) {
      return res.status(400).json({
        success: false,
        message: "Estado no válido",
      })
    }

    const devolucion = await Devolucion.findByIdAndUpdate(id, { estado }, { new: true, runValidators: true })

    if (!devolucion) {
      return res.status(404).json({
        success: false,
        message: "Devolución no encontrada",
      })
    }

    res.status(200).json({
      success: true,
      message: "Estado de devolución actualizado",
      devolucion,
    })
  } catch (error) {
    console.error("Error al actualizar estado de devolución:", error)
    res.status(500).json({
      success: false,
      message: "Error al actualizar estado de devolución",
      error: error.message,
    })
  }
}

// Eliminar una devolución
const eliminarDevolucion = async (req, res) => {
  try {
    // Eliminar los detalles asociados usando el campo correcto del esquema
    await DetalleDevolucion.deleteMany({ devolucionId: req.params.id }) // Usar devolucionId como está en el esquema

    // Luego eliminar la devolución
    const devolucion = await Devolucion.findByIdAndDelete(req.params.id)

    if (!devolucion) {
      return res.status(404).json({
        success: false,
        message: "Devolución no encontrada",
      })
    }

    res.status(200).json({
      success: true,
      message: "Devolución eliminada exitosamente",
    })
  } catch (error) {
    console.error(`Error al eliminar devolución con ID ${req.params.id}:`, error)
    res.status(500).json({
      success: false,
      message: "Error al eliminar la devolución",
      error: error.message,
    })
  }
}

// EXPORTAR TODAS LAS FUNCIONES
module.exports = {
  crearDevolucion,
  procesarDevolucionCompleta,
  procesarDevolucionBasica,
  obtenerDevoluciones,
  obtenerDevolucionPorId,
  obtenerDevolucionesPorVenta,
  actualizarDevolucion,
  actualizarEstadoDevolucion,
  eliminarDevolucion,
}