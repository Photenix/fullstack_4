// backend/src/Models/Supplier.js
import { model, Schema } from "mongoose";

const SupplierSchema = new Schema({
  nit: { type: String, required: true, description: "Id of company", unique: true },
  companyName: { type: String, required: true },
  contact: { 
    type: String, 
    required: true,
    description: "concat is the person name concatenated example Carla Martinez"
  },
  city: { type: String, required: true },
  country: { type: String, required: true },
  address: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  state: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

export default model('Supplier', SupplierSchema)
