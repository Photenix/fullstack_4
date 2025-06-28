import Purchase from "../Models/compra.js"
import Product from "../Models/Products.js"

const getPurchases = async (req, res) => {
  try {
    const limit = req.query.limit || 100 // I put 100 if maybe don't used the funcionality
    const page = req.query.page || 1
    const offset = (page - 1)  * limit

    const purchases = await Purchase.find()
      .populate("supplierId")
      .populate("products.productId")
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
    res.json(purchases)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const getPurchaseById = async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id).populate("supplierId").populate("products.productId")
    if (!purchase) return res.status(404).json({ message: "compra no encontrada" })
    res.json(purchase)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const cancelPurchase = async (req, res) => {
  try {
    // console.log("=== INICIO CANCELACIÓN DE COMPRA ===")
    // console.log("ID de compra:", req.params.id)
    // console.log("Datos recibidos del frontend:", req.body)

    // Buscar la compra por ID
    const purchase = await Purchase.findById(req.params.id)
    if (!purchase) {
      // console.log("❌ Compra no encontrada")
      return res.status(404).json({ message: "Compra no encontrada", success: false })
    }

    // console.log("✅ Compra encontrada:", purchase.invoiceNumber)

    // Verificar si ya está cancelada
    if (purchase.status === "Canceled") {
      // console.log("❌ La compra ya está cancelada")
      return res.status(400).json({ message: "La compra ya está cancelada", success: false })
    }

    // Obtener el motivo de cancelación del cuerpo de la petición
    const { cancellationReason = "", restoreStock = true, isDecrease = true } = req.body
    // console.log("Motivo de cancelación:", cancellationReason)
    // console.log("Restaurar stock:", restoreStock)
    // console.log("Es decremento:", isDecrease)

    // Solo restaurar stock si restoreStock es true
    if (restoreStock) {
      // console.log("=== INICIANDO RESTAURACIÓN DE STOCK ===")

      for (const item of purchase.products) {
        // console.log(`\n--- Procesando producto: ${item.productId} ---`)
        // console.log(`Cantidad a restaurar: ${item.quantity}`)
        // console.log(`Detail ID: ${item.detailId}`)

        try {
          // CORRECCIÓN: Al cancelar una compra, debemos DECREMENTAR el stock
          // porque queremos volver al estado anterior a la compra
          const stockChange = isDecrease ? -item.quantity : item.quantity
          
          const detailUpdateResult = await Product.updateOne(
            { "details._id": item.detailId.toString() },
            { $inc: { "details.$.quantity": stockChange } }, // NEGATIVO para decrementar
            { new: true }
          )

        } catch (detailError) {
          console.error(`❌ Error al restaurar el stock del producto ${item.productId}:`, detailError)
          // Continuar con el siguiente producto en lugar de fallar completamente
        }
        finally {
          const product = await Product.findById(item.productId)
          if (product) {
            const countAll = product.details.reduce((acc, detail) => acc + detail.quantity, 0)
            
            product.totalQuantity = countAll
            await product.save()
          }
        }
      }

      // console.log("=== RESTAURACIÓN DE STOCK COMPLETADA ===")
    } else {
      console.log("ℹ️ Saltando restauración de stock (restoreStock = false)")
    }

    // Actualizar el estado y el motivo de cancelación
    console.log("=== ACTUALIZANDO ESTADO DE LA COMPRA ===")
    const updatedPurchase = await Purchase.findByIdAndUpdate(
      req.params.id,
      {
        status: "Canceled",
        cancellationReason: cancellationReason,
      },
      { new: true, runValidators: false },
    )
      .populate("supplierId")
      .populate("products.productId")

    console.log("✅ Compra actualizada:", updatedPurchase.status)
    console.log("✅ Motivo guardado:", updatedPurchase.cancellationReason)

    res.json({
      message: "Compra cancelada exitosamente",
      success: true,
      data: updatedPurchase,
    })

    console.log("=== CANCELACIÓN COMPLETADA EXITOSAMENTE ===")
  } catch (error) {
    console.error("❌ Error al cancelar compra:", error)
    res.status(500).json({ message: error.message, success: false })
  }
}

// Controlador para crear compra
const createPurchase = async (req, res) => {
  const { supplierId, products, invoiceNumber } = req.body

  try {
    if (!invoiceNumber) {
      return res.status(400).json({
        message: "El número de factura es obligatorio",
        success: false,
      })
    }

    const existingPurchase = await Purchase.findOne({ invoiceNumber })
    if (existingPurchase) {
      return res.status(400).json({
        message: "El número de factura ya está en uso",
        success: false,
      })
    }

    const total = products.reduce((acc, item) => acc + item.quantity * item.price, 0)

    // Crear un array para almacenar los productos con sus detalles
    const purchaseProducts = []

    // Procesar cada producto y actualizar el stock
    for (const item of products) {
      // Validar que el producto exista
      const product = await Product.findById(item.productId)
      if (!product) {
        return res.status(404).json({
          message: `Producto con ID ${item.productId} no encontrado`,
          success: false,
        })
      }

      // Añadir el producto a la lista de la compra
      purchaseProducts.push({
        productId: item.productId,
        detailId: item.detailId, // Guardar el ID del detalle en la compra
        quantity: item.quantity,
        price: item.price,
      })

      // Al CREAR una compra, INCREMENTAMOS el stock (porque recibimos productos)
      await Product.findByIdAndUpdate(item.productId, { $inc: { totalQuantity: item.quantity } })

      // Si hay un detailId, actualizar también el detalle específico
      if (item.detailId) {
        console.log(`Actualizando detalle ${item.detailId} del producto ${item.productId}`)
        console.log(`Cantidad a incrementar: ${item.quantity}`)

        try {
          // Obtener el detalle actual para verificar
          const productBefore = await Product.findOne({ "details._id": item.detailId.toString() }, { "details.$": 1 })

          if (productBefore && productBefore.details && productBefore.details.length > 0) {
            console.log("Detalle antes de actualizar:", productBefore.details[0])
          }

          // Al CREAR una compra, INCREMENTAMOS el stock del detalle
          const updateResult = await Product.updateOne(
            { "details._id": item.detailId.toString() },
            { $inc: { "details.$.quantity": item.quantity } }, // POSITIVO para incrementar
          )

          console.log("Resultado de la actualización:", updateResult)

          // Verificar que la actualización se haya realizado correctamente
          const productAfter = await Product.findOne({ "details._id": item.detailId.toString() }, { "details.$": 1 })

          if (productAfter && productAfter.details && productAfter.details.length > 0) {
            console.log("Detalle después de actualizar:", productAfter.details[0])
          }
        } catch (detailError) {
          console.error(`Error al actualizar el detalle ${item.detailId}:`, detailError)
        }
      }
    }

    // Crear la compra con los productos procesados
    const purchase = new Purchase({
      invoiceNumber,
      supplierId,
      products: purchaseProducts,
      total,
      status: "Active",
    })

    await purchase.save()
    res.status(201).json({ data: purchase, success: true })
  } catch (error) {
    console.error("Error al crear la compra:", error)
    res.status(400).json({ message: error.message, success: false })
  }
}

const updatePurchase = async (req, res) => {
  try {
    const updatedPurchase = await Purchase.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!updatedPurchase) return res.status(404).json({ message: "compra no encontrada" })
    res.json(updatedPurchase)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

const deletePurchase = async (req, res) => {
  try {
    const purchase = await Purchase.findByIdAndDelete(req.params.id)
    if (!purchase) return res.status(404).json({ message: "compra no encontrada" })
    res.json({ message: "La compra ha sido eliminada correctamente" })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export { getPurchases, getPurchaseById, createPurchase, updatePurchase, deletePurchase }
