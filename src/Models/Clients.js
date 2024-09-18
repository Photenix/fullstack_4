import { Schema, model } from "mongoose";

const clientSchema = new Schema({
    name: { type: String, required: true },
    lastName: { type: String, required: true },
    documentNumber: { type: String, required: false, unique: true },
    birthdate: { type: Date, required: true },
    gender: { type: String, required: true, enum: ['M', 'F', 'O'] },
    phone: { type: String, required: true },
    address: { type: String, required: false },
    email: { type: String, required: true, unique: true},
    rol: { type: Schema.Types.ObjectId, required: true, ref: 'rol' },
    state: { type: Boolean, required:true, default: true }
    // resetToken: { type: String },
    // resetTokenExpiration: { type: Date }
})

export default model('Client', clientSchema)