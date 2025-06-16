const mongoose = require("mongoose")

const DetalleDevolucionSchema = new mongoose.Schema(
  {
    devolucionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Devolucion",
      required: true,
      description: "ID de la devolución principal",
    },
    productoId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      description: "ID del producto devuelto",
    },
    nombreProducto: {
      type: String,
      required: true,
      description: "Nombre del producto devuelto",
    },
    cantidad: {
      type: Number,
      required: true,
      min: 1,
      description: "Cantidad devuelta del producto",
    },
    precio: {
      type: Number,
      required: true,
      min: 0,
      description: "Precio unitario del producto al momento de la devolución",
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
      description: "Subtotal de la devolución (cantidad * precio)",
    },
    motivo: {
      type: String,
      required: true,
      description: "Motivo de la devolución del producto",
    },
    estado: {
      type: String,
      enum: ["Pendiente", "Aprobado", "Rechazado"],
      default: "Pendiente",
      description: "Estado del detalle de devolución",
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        // Agregar campos virtuales para compatibilidad con SQL
        ret.DetailReturn_ID = ret._id
        ret.Return_ID = ret.devolucionId
        ret.Article_ID = ret.productoId
        ret.Quantity = ret.cantidad
        ret.Reason = ret.motivo
        ret.State_ = ret.estado
        return ret
      },
    },
  },
)

const DetalleDevolucion = mongoose.model("DetalleDevolucion", DetalleDevolucionSchema)
module.exports = DetalleDevolucion
