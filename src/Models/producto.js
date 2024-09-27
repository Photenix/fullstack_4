import mongoose from 'mongoose';

const productoSchema = new mongoose.Schema({
  idProd: { type: Number, required: true, unique: true },
  nombreProd: { type: String, required: true, maxlength: 30 },
  valorProd: { type: Number, required: true },
  stockProd: { type: Number, required: true },
  idCProd: { type: Number, required: true },
  idClas: { type: Number, required: true },
  estadoProd: { type: Boolean, required: true }
});

const Producto = mongoose.model('Producto', productoSchema);

export default Producto;