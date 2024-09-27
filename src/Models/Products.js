import { Schema, model } from "mongoose";

const productDetailSchema = new Schema({
    color: {
        type: String,
        required: true,
        enum: ['Red', 'Blue', 'Green', 'Black', 'White', 'Yellow', 'Purple', 'Gray', 'Orange', 'Pink', 'Brown', 'Other']
    },
    size: {
        type: String,
        required: true,
        enum: ['XS','S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'Other']
    },
    quantity: {
        type: Number,
        required: true,
        min: 0
    }
})

const productSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    totalQuantity: {
        type: Number,
        required: true,
        min: 0
    },
    category: {
        // type: Schema.Types.ObjectId,
        type: String,
        required: true,
        // ref: 'category'
    },
    classification:{ // tambien puede ser llamado nicho pero queda en determinación de sebastian
        describe: "Define the sex of a product, if is a shoe of woman o man",
        type: String,
        required: true,
        enum: ['Male', 'Female', 'Girl', 'Boy', 'Unisex'],
    },
    details:{
        type: [productDetailSchema],
        required: true
    },
    state:{
        type: Boolean,
        required: true,
        default: true
    }
})


productSchema.index({ 'name':1, 'details.size': 1, 'details.color': 1 }, { unique: true });


export default model('Product', productSchema)