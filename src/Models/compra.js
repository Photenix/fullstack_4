import mongoose from "mongoose"

const PurchaseSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    required: true,
    unique: true,
  },
  supplierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Supplier",
    required: true,
  },
  products: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      detailId: {
        type: mongoose.Schema.Types.ObjectId,
        required: false, // El detailId específico del producto
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
      },
      price: {
        type: Number,
        required: true,
        min: 0,
      },
    },
  ],
  total: {
    type: Number,
    required: true,
    min: 0,
  },
  purchaseDate: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["Active", "Canceled"],
    default: "Active",
  },
  cancellationReason: {
    type: String,
    default: "",
    maxlength: 500,
  },
})

const Purchase = mongoose.model("Purchase", PurchaseSchema)
export default Purchase
