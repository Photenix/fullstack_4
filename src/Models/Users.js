import { Schema, model } from "mongoose";
const bcrypt = require('bcrypt');

const userSchema = new Schema({
    typeIdentifier: { type: String, required: true, description: "Can be CC, DPI or Passport", enum: ["CC", "DPI", "Passport"]},
    documentNumber : { type: String, required: true, unique: true },
    username: { type: String, required: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    birthdate: { type: Date, required: true },
    country: { type: String, required: true },
    city: { type: String, required: true },
    address: { type: String, required: false },
    userCreationDate: { type: Date, required:true, default: new Date() },
    rol: { type: Schema.Types.ObjectId, required: true, ref: 'rol' },
    // role: { type: String, required: true, enum: ['Admin', 'Worker', 'Client'], default: 'Client' },
    state: { type: Boolean, required: true, default: true }
})

userSchema.pre("save", async function(next){
    if (!this.isModified('password')) return next();
    const saltRounds = 10;
    try {
        this.password = await bcrypt.hash(this.password, saltRounds);
        next();
    } catch (error) {
        next(error);
    }
})

export default model('User', userSchema)