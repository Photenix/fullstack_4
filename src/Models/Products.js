import { Schema, model } from "mongoose";

const productDetailSchema = new Schema({
    barcode :{
        describe: "The barcode has to be unique and is unique by product detail the main product has not be barcode",
        type: String,
        // required: true,
        // unique: true,
        validate: {
            validator: (v) => {
                if( v.length === 0 ) return true
                return /^[0-9]{13}$/.test(v)
            },
            message: 'Please enter a valid barcode (13 digits)'
        }
    },
    // color: {
    //     type: String,
    //     required: true,
    // enum: ['Red', 'Blue', 'Green', 'Black', 'White', 'Yellow', 'Purple', 'Gray', 'Orange', 'Pink', 'Brown', 'Other']
    // },
    purchasePrice: {
        type: Number,
        // required: true,
        min: 0,
        default: 0
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    size: {
        type: String,
        required: true,
        minlength: 1,
        maxlength: 15,
        // enum: ['XS','S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'Other']
    },
    quantity: {
        type: Number,
        required: true,
        min: 0,
        describe: "The quantity is the quantity on stock of the product"
    },
    // the discount can be of 0% or 70%, depending of the quantity or product
    discount: {
        type: Number,
        required: true,
        min: 0,
        max: 80,
        default: 0
    },
    /*
    image: {
        type: Schema.Types.Mixed,
        required: true,
        validate: {
            validator: (v) => /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/.test(v),
            message: 'Please enter a valid URL'
        }
    }
    */
})

// when I say product Schema I make reference to the normal name of the product and category
const productSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        maxlength: 500,
        message: 'La descripción debe tener un máximo de 200 caracteres.',
        default: ''
    },
    totalQuantity: {
        type: Number,
        required: true,
        min: 0
    },
    category: {
        type: Schema.Types.ObjectId,
        // type: String,
        required: true,
        ref: 'category'
    },
    classification:{ // tambien puede ser llamado nicho pero queda en determinación de sebastian
        describe: "Define the sex of a product, if is a shoe of woman o man",
        type: String,
        required: true,
        enum: ['Male', 'Female', 'Girl', 'Boy', 'Unisex'],
    },
    color: {
        type: String,
        // required: true,
    },
    details:{
        type: [productDetailSchema],
        required: true
    },
    images:{
        type: [String],
        validate: {
            validator: (v) => Array.isArray(v) && v.every(url => /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/.test(url)),
            message: 'Please enter a valid URL'
        }
    },
    state:{
        type: Boolean,
        required: true,
        default: true
    }
})


//! Find whent the product is unique and why
productSchema.index({ 'name':1, 'details.size': 1, 'details.color': 1 }, { unique: true });


productSchema.post("findOneAndUpdate", async function(doc) {
    // `doc` es el documento actualizado
    if (doc && doc.details) {
        const details = doc.details;
        // Calcular la cantidad total de los detalles
        let totalQuantity = 0;
        for (let i = 0; i < details.length; i++) {
            const detail = details[i];
            totalQuantity += detail.quantity;
        }
        // Actualizar el campo totalQuantity en el documento
        doc.totalQuantity = totalQuantity;
        // console.log(doc);
        // console.log( details );
        
        // console.log(doc.totalQuantity);
        await doc.save({ timestamps: false, new: true }); // Guardar el documento actualizado
    }
});


export default model('Product', productSchema)