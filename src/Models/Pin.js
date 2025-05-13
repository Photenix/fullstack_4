import { Schema, model } from "mongoose";

const PinSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },	
  email: { type: String, required: true, unique: true },
  pin: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: '5m' } // El pin expira en 5 minutos
});

export default model('Pin', PinSchema)