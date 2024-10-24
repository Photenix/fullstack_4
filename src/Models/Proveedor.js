// backend/src/Models/Supplier.js
import mongoose from 'mongoose';

const SupplierSchema = new mongoose.Schema({
    companyName: {
        type: String,
        required: true,   
    },
    nit: {
        type: String,
        required: true
    },
    contact: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },

state: {
    type: Boolean,
    default: true
}
});

const Supplier = mongoose.model('Supplier', SupplierSchema);
export default Supplier;
