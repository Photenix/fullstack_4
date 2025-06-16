const mongoose = require("mongoose")

const DevolucionSchema = new mongoose.Schema(
  {
    // Campo compatible con SQL (Sale_ID)
    ventaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Venta",
      required: true,
      description: "ID de la venta original",
    },
    // Campo compatible con SQL (return_date)
    fecha: {
      type: Date,
      default: Date.now,
      description: "Fecha de la devolución",
    },
    // Campo compatible con SQL (worthTotal)
    totalDevuelto: {
      type: Number,
      required: true,
      description: "Monto total devuelto",
    },
    // Campo compatible con SQL (State_)
    estado: {
      type: String,
      enum: ["Pendiente", "Aprobado", "Rechazado"],
      default: "Pendiente",
      description: "Estado de la devolución",
    },
  },
  {
    timestamps: true, // Agrega createdAt y updatedAt
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        // Agregar campos virtuales para compatibilidad con SQL
        ret.Return_ID = ret._id
        ret.Sale_ID = ret.ventaId
        ret.return_date = ret.fecha
        ret.worthTotal = ret.totalDevuelto
        ret.State_ = ret.estado
        return ret
      },
    },
  },
)

const Devolucion = mongoose.model("Devolucion", DevolucionSchema)
module.exports = Devolucion // Corregido: era DevolucionAttachment, ahora Devolucion