// backend/src/Models/Purchase.js
import mongoose from 'mongoose';

const PurchaseSchema = new mongoose.Schema({
    supplier:  {
        // type: mongoose.Schema.Types.ObjectId,
        type: String,
        ref: 'Supplier',
        required: true
    },
    product: {
        type: {String},
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    total: {
        type: Number,
        required: true
    },
    purchaseDate: {
        type: Date,
        default: Date.now
    },
    state:{
        type:Boolean,
        default: true
    }
    
});

const Purchase = mongoose.model('Purchase', PurchaseSchema);
export default Purchase;
