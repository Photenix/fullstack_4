// CORRECCIÓN COMPLETA: Importar el modelo Product correctamente
const mongoose = require("mongoose")

// Intentar múltiples formas de importar el modelo Product
let Product

try {
  // Opción 1: Importación directa
  Product = require("../Models/Products").default
} catch (error1) {
  // console.log("Error importando Products.default:", error1.message)
  try {
    // Opción 2: Importación sin .default
    Product = require("../Models/Products")
  } catch (error2) {
    // console.log("Error importando Products:", error2.message)
    try {
      // Opción 3: Importación con nombre diferente
      Product = require("../Models/productSchema")
    } catch (error3) {
      // console.log("Error importando productSchema:", error3.message)
      try {
        // Opción 4: Usar modelo registrado en mongoose
        Product = mongoose.model("Product")
      } catch (error4) {
        // console.log("Error obteniendo modelo Product de mongoose:", error4.message)
        console.error("CRÍTICO: No se pudo importar el modelo Product")
      }
    }
  }
}

// console.log("=== INICIALIZACIÓN STOCK SERVICE ===")
// console.log("Modelo Product disponible:", !!Product)
// console.log("Tipo de Product:", typeof Product)
// console.log("Product.findById disponible:", typeof Product?.findById)

/**
 * Valida si hay suficiente stock para los productos de una venta
 * @param {Array} productosVenta - Array de productos con {productoId, cantidad}
 * @returns {Object} Resultado de la validación
 */
const validarStockParaVenta = async (productosVenta) => {
  try {
    // console.log("=== INICIANDO VALIDACIÓN DE STOCK ===")
    // console.log("Productos a validar:", JSON.stringify(productosVenta, null, 2))

    // Verificar que el modelo Product esté disponible
    if (!Product || typeof Product.findById !== "function") {
      console.error("ERROR CRÍTICO: Modelo Product no está disponible")
      return {
        esValido: false,
        errores: [
          {
            error: "Error de configuración: Modelo Product no disponible",
            detalles: "El modelo Product no está correctamente importado",
          },
        ],
        productosValidados: [],
        mensaje: "Error de configuración del servidor",
      }
    }

    // Validar que productosVenta sea un array válido
    if (!Array.isArray(productosVenta) || productosVenta.length === 0) {
      console.error("Error: productosVenta no es un array válido:", productosVenta)
      return {
        esValido: false,
        errores: [
          {
            error: "No se proporcionaron productos para validar",
          },
        ],
        productosValidados: [],
        mensaje: "No se proporcionaron productos para validar",
      }
    }

    const erroresStock = []
    const productosValidados = []

    // DEBUGGING: Verificar conexión a la base de datos
    // console.log("Estado de conexión a MongoDB:", mongoose.connection.readyState)
    // console.log("Nombre de la base de datos:", mongoose.connection.name)

    // DEBUGGING: Obtener algunos productos de ejemplo para verificar la conexión
    try {
      // console.log("=== VERIFICANDO CONEXIÓN A LA BASE DE DATOS ===")
      const productosEjemplo = await Product.find({}).limit(3).select("_id name")
      // console.log("Productos de ejemplo en la base de datos:")
      productosEjemplo.forEach((p, index) => {
        // console.log(`${index + 1}. ID: ${p._id}, Nombre: ${p.name}`)
      })

      if (productosEjemplo.length === 0) {
        console.warn("⚠️ No se encontraron productos en la base de datos")
      }
    } catch (dbError) {
      console.error("Error al verificar la conexión a la base de datos:", dbError)
      return {
        esValido: false,
        errores: [
          {
            error: "Error de conexión a la base de datos",
            detalles: dbError.message,
          },
        ],
        productosValidados: [],
        mensaje: "Error de conexión a la base de datos",
      }
    }

    for (let i = 0; i < productosVenta.length; i++) {
      const productoVenta = productosVenta[i]
      // console.log(`\n--- Validando producto ${i + 1}/${productosVenta.length} ---`)
      // console.log("Datos del producto:", JSON.stringify(productoVenta, null, 2))

      const { productoId, cantidad, nombre } = productoVenta

      // Validar que los datos del producto sean válidos
      if (!productoId) {
        console.error("Error: productoId no proporcionado para el producto:", productoVenta)
        erroresStock.push({
          productoId: "unknown",
          nombre: nombre || "Producto desconocido",
          error: "ID de producto no proporcionado",
        })
        continue
      }

      if (!cantidad || cantidad <= 0) {
        console.error("Error: cantidad inválida para el producto:", productoVenta)
        erroresStock.push({
          productoId,
          nombre: nombre || "Producto desconocido",
          error: "Cantidad inválida",
        })
        continue
      }

      try {
        // console.log(`Buscando producto con ID: ${productoId}`)
        // console.log(`Tipo de productoId: ${typeof productoId}`)
        // console.log(`Longitud de productoId: ${productoId.length}`)

        // Verificar si el ID es un ObjectId válido de MongoDB
        if (!mongoose.Types.ObjectId.isValid(productoId)) {
          console.error(`ID de producto no válido para MongoDB: ${productoId}`)
          erroresStock.push({
            productoId,
            nombre: nombre || "Producto desconocido",
            error: "ID de producto no válido",
          })
          continue
        }

        // console.log("=== BÚSQUEDA DETALLADA DEL PRODUCTO ===")

        // Búsqueda principal por ID
        // console.log("1. Buscando por findById...")
        const producto = await Product.findById(productoId)
        // console.log("Resultado findById:", producto ? "ENCONTRADO" : "NO ENCONTRADO")

        if (!producto) {
          // Búsquedas alternativas para debugging - CORREGIDAS
          // console.log("2. Buscando por _id con findOne...")
          const productoPorId = await Product.findOne({ _id: productoId })
          // console.log("Resultado findOne por _id:", productoPorId ? "ENCONTRADO" : "NO ENCONTRADO")

          // console.log("3. Buscando por _id como string...")
          const productoPorString = await Product.findOne({ _id: productoId.toString() })
          // console.log("Resultado findOne por string:", productoPorString ? "ENCONTRADO" : "NO ENCONTRADO")

          // Búsqueda por nombre si está disponible - CORREGIDA
          if (nombre) {
            // console.log(`4. Buscando por nombre: "${nombre}"`)
            try {
              const productoPorNombre = await Product.findOne({
                name: { $regex: nombre, $options: "i" },
              })
              // console.log("Resultado búsqueda por nombre:", productoPorNombre ? "ENCONTRADO" : "NO ENCONTRADO")

              if (productoPorNombre) {
                // console.log(`✓ Producto encontrado por nombre - ID real: ${productoPorNombre._id}`)
                // console.log(`✗ ID buscado: ${productoId}`)
                // console.log(`✗ ¿Son iguales?: ${productoPorNombre._id.toString() === productoId.toString()}`)
              }
            } catch (regexError) {
              // console.log("Error en búsqueda por nombre:", regexError.message)
            }
          }

          // CORREGIDO: Búsqueda de productos similares sin usar $regex en _id
          // console.log("5. Obteniendo productos recientes para comparar...")
          try {
            const productosRecientes = await Product.find({}).sort({ _id: -1 }).limit(5).select("_id name")

            if (productosRecientes.length > 0) {
              // console.log("Productos recientes en la base de datos:")
              productosRecientes.forEach((p) => {
                // console.log(`- ${p._id} (${p.name})`)
                // Comparar si algún ID es similar
                if (p._id.toString().includes(productoId.substring(0, 10))) {
                  // console.log(`  ↳ ID similar encontrado!`)
                }
              })
            }
          } catch (similarError) {
            // console.log("Error al buscar productos similares:", similarError.message)
          }

          console.error(`❌ Producto NO encontrado con ID: ${productoId}`)
          erroresStock.push({
            productoId,
            nombre: nombre || "Producto desconocido",
            error: "Producto no encontrado en la base de datos",
          })
          continue
        }

        // console.log("✅ Producto encontrado!")
        // console.log("Datos del producto:", {
        //   _id: producto._id,
        //   name: producto.name,
        //   state: producto.state,
        //   detailsLength: producto.details ? producto.details.length : "NO DETAILS",
        // })

        // Verificar si el producto está activo
        if (!producto.state) {
          console.error(`Producto inactivo: ${producto.name}`)
          erroresStock.push({
            productoId,
            nombre: producto.name,
            error: "Producto no disponible (inactivo)",
          })
          continue
        }

        // Verificar que el producto tenga detalles
        if (!producto.details || !Array.isArray(producto.details)) {
          console.error(`Producto sin detalles válidos: ${producto.name}`)
          erroresStock.push({
            productoId,
            nombre: producto.name,
            error: "Producto sin detalles de stock",
          })
          continue
        }

        // console.log("Detalles del producto:")
        producto.details.forEach((detalle, index) => {
          // console.log(`  ${index + 1}. ID: ${detalle._id}, Talla: ${detalle.size}, Cantidad: ${detalle.quantity}`)
        })

        // Calcular stock total disponible
        let stockTotal = 0
        for (const detalle of producto.details) {
          if (detalle.quantity && typeof detalle.quantity === "number" && detalle.quantity > 0) {
            stockTotal += detalle.quantity
          }
        }

        // console.log(`Stock total calculado: ${stockTotal}, Cantidad solicitada: ${cantidad}`)

        // Verificar si hay suficiente stock
        if (cantidad > stockTotal) {
          console.error(`❌ Stock insuficiente para ${producto.name}`)
          console.error(`   Disponible: ${stockTotal}, Solicitado: ${cantidad}`)
          erroresStock.push({
            productoId,
            nombre: producto.name,
            cantidadSolicitada: cantidad,
            stockDisponible: stockTotal,
            error: `Stock insuficiente. Disponible: ${stockTotal}, Solicitado: ${cantidad}`,
          })
          continue
        }

        // Si pasa todas las validaciones, agregar a productos validados
        // console.log(`✅ Producto ${producto.name} validado correctamente`)
        productosValidados.push({
          productoId,
          nombre: producto.name,
          cantidad,
          stockDisponible: stockTotal,
          producto: producto,
        })
      } catch (productError) {
        console.error(`❌ Error al procesar producto ${productoId}:`, productError)
        console.error("Stack trace:", productError.stack)
        erroresStock.push({
          productoId,
          nombre: nombre || "Producto desconocido",
          error: `Error al verificar producto: ${productError.message}`,
        })
      }
    }

    const resultado = {
      esValido: erroresStock.length === 0,
      errores: erroresStock,
      productosValidados: productosValidados,
      mensaje:
        erroresStock.length > 0
          ? `Se encontraron ${erroresStock.length} error(es) de stock`
          : "Todos los productos tienen stock suficiente",
    }

    // console.log("=== RESULTADO FINAL DE VALIDACIÓN ===")
    // console.log("Es válido:", resultado.esValido)
    // console.log("Número de errores:", resultado.errores.length)
    // console.log("Productos validados:", resultado.productosValidados.length)

    return resultado
  } catch (error) {
    console.error("=== ERROR CRÍTICO EN VALIDACIÓN DE STOCK ===")
    console.error("Error completo:", error)
    console.error("Stack trace:", error.stack)

    return {
      esValido: false,
      errores: [
        {
          error: `Error crítico en validación: ${error.message}`,
          detalles: error.stack,
        },
      ],
      productosValidados: [],
      mensaje: `Error crítico al validar stock: ${error.message}`,
    }
  }
}

/**
 * Actualiza el stock después de una venta exitosa
 * @param {Array} productosVenta - Array de productos vendidos
 * @returns {Object} Resultado de la actualización
 */
const actualizarStockDespuesVenta = async (productosVenta) => {
  try {
    // console.log("=== INICIANDO ACTUALIZACIÓN DE STOCK ===")
    // console.log("Productos a actualizar:", JSON.stringify(productosVenta, null, 2))

    const resultados = []

    for (const productoVenta of productosVenta) {
      const { productoId, cantidad } = productoVenta

      try {
        // console.log(`Actualizando stock para producto: ${productoId}`)

        // Buscar el producto
        const producto = await Product.findById(productoId)

        if (!producto) {
          console.error(`Producto no encontrado para actualización: ${productoId}`)
          resultados.push({
            productoId,
            exito: false,
            mensaje: "Producto no encontrado",
          })
          continue
        }

        // Encontrar el detalle con mayor stock para descontar
        let cantidadRestante = cantidad
        const detallesActualizados = []

        for (const detalle of producto.details) {
          if (cantidadRestante <= 0) break

          const cantidadADescontar = Math.min(detalle.quantity, cantidadRestante)

          if (cantidadADescontar > 0) {
            const nuevaCantidad = detalle.quantity - cantidadADescontar

            // Actualizar el detalle
            const updateData = {
              ...detalle.toObject(),
              quantity: nuevaCantidad,
            }

            // console.log(`Actualizando detalle ${detalle._id}: ${detalle.quantity} -> ${nuevaCantidad}`)
            const productoActualizado = await updateProductDetail(detalle._id, updateData)

            if (productoActualizado) {
              detallesActualizados.push({
                detalleId: detalle._id,
                cantidadAnterior: detalle.quantity,
                cantidadNueva: nuevaCantidad,
                cantidadDescontada: cantidadADescontar,
              })

              cantidadRestante -= cantidadADescontar
            }
          }
        }

        resultados.push({
          productoId,
          exito: cantidadRestante === 0,
          cantidadTotal: cantidad,
          cantidadDescontada: cantidad - cantidadRestante,
          detallesActualizados,
          mensaje:
            cantidadRestante === 0
              ? "Stock actualizado correctamente"
              : `No se pudo descontar toda la cantidad. Faltaron ${cantidadRestante} unidades`,
        })
      } catch (productError) {
        console.error(`Error al actualizar producto ${productoId}:`, productError)
        resultados.push({
          productoId,
          exito: false,
          mensaje: `Error al actualizar: ${productError.message}`,
        })
      }
    }

    // console.log("=== RESULTADO ACTUALIZACIÓN DE STOCK ===")
    // console.log("Resultados:", resultados)

    return {
      exito: resultados.every((r) => r.exito),
      resultados,
    }
  } catch (error) {
    console.error("=== ERROR CRÍTICO EN ACTUALIZACIÓN DE STOCK ===")
    console.error("Error completo:", error)
    console.error("Stack trace:", error.stack)

    return {
      exito: false,
      resultados: [],
      mensaje: `Error crítico al actualizar stock: ${error.message}`,
    }
  }
}

/**
 * Función auxiliar para actualizar detalle de producto
 */
const updateProductDetail = async (idDetail, updateData) => {
  try {
    // console.log(`Actualizando detalle de producto: ${idDetail}`)
    const product = await Product.findOneAndUpdate(
      { "details._id": idDetail },
      { $set: { "details.$": updateData } },
      { new: true },
    )
    // console.log("Detalle actualizado:", product ? "SÍ" : "NO")
    return product
  } catch (e) {
    console.error("Error al actualizar detalle de producto:", e)
    return null
  }
}

module.exports = {
  validarStockParaVenta,
  actualizarStockDespuesVenta,
  updateProductDetail,
}
