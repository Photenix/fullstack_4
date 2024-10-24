import Products from "../Models/Products";
import validateInformationField from "../Tools/creation.tool";
import { v2 as cloudinary } from 'cloudinary';

const PRODUCT_VALUES = [
    "name", "price", "totalQuantity",
    "category", "classification", "details"
]

cloudinary.config({ 
    cloud_name: 'photenix', 
    api_key: '192637173257687', 
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const getProducts = async ( req, res ) =>{
    const limit = req.query.limit || 10
    const page = req.query.page || 1
    const offset = (page - 1)  * limit
    const products = await Products.find().skip(offset).limit(limit);
    res.status(200).json(products);
}

const getProductById = async ( req, res ) => {
    try{
        const product = await Products.findById(req.params.id);
        res.status(200).json({ data: product, success: true });
    }
    catch(e){
        res.status(404).json({ message: 'Error producto no encontrado', error: e.message, success: false });
    }
}

const searchProducts = async ( req, res ) => {
    const { find } = req.body
    try{
        const products = await Products.find({ name: { $regex: `^${find}.*`, $options: 'i' } },);
        res.status(200).json({ data: products, success: true });
    }
    catch(e){
        res.status(500).json({ message: 'Error al buscar productos', error: e.message, success: false });
    }
}

const createProduct = async ( req, res ) => {
    try{
        const [ success, message, info ] = validateInformationField( PRODUCT_VALUES, req.body )
        //return a status error user
        if( success === false ) return res.status(400).json({ message, success: false });

        if( info.details.length === 0 ) return res.status(400).json({ message: "Not exist detail, min detail is 1", success: false });

        const product = new Products(info);
        await product.save();
        res.json({ message: 'Producto creado correctamente', data: product, success: true });
    }
    catch(e){
        res.json({ message: 'Error al crear el producto', error: e.message, success: false });
    }
}

const createProductImage = async ( req, res ) => {
    try {
        const fileStr = req.body.data;
        const uploadResponse = await cloudinary.uploader.upload(fileStr, {
            upload_preset: 'ml_default',
            folder: 'Boutique'
        });
        // console.log(uploadResponse);
        res.json({ msg: 'created image', img: uploadResponse.url });
    } catch (err) {
        console.error(err);
        res.status(500).json({ err: 'Something went wrong' });
    }
}

const updateProduct = async ( req, res ) => {
    const { id, changes } = req.body;
    try{
        if( changes.details !== undefined  && changes?.details.length !== 0 ){
            if( changes.details.length > 1 ){
                //intera mas de un detalle de producto
                await Products.findByIdAndUpdate(id, { $push: { details: { $each: changes.details } } });
            }
            //solo ingresa un detalle de producto
            else await Products.findByIdAndUpdate(id, { $push: { details: changes.details } });
            delete changes.details
        }

        const product = await Products.findByIdAndUpdate(id, changes);
        res.json({ message: 'Producto actualizado correctamente', data: product, success: true });
    }
    catch(e){
        res.json({ message: 'Error al actualizar el producto', error: e.message, success: false });
    }
}


const deleteProduct = async ( req, res ) => {
    const { id } = req.params;
    try{
        const product = await Products.findByIdAndDelete(id);
        res.json({ message: 'Producto eliminado correctamente', data: product, success: true });
    }
    catch(e){
        res.json({ message: 'Error al eliminar el producto', error: e.message, success: false });
    }
}

const deleteDetailProduct = async ( req, res ) => {
    const { id, detailId } = req.body;
    try{
        const product = await Products.findByIdAndUpdate(id, { $pull: { details: { _id: detailId } } });
        res.json({ message: 'Detalle eliminado correctamente', data: product, success: true });
    }
    catch(e){
        res.json({ message: 'Error al eliminar el detalle', error: e.message, success: false });
    }
}

export { getProducts, getProductById, searchProducts, createProduct, createProductImage, updateProduct, deleteProduct, deleteDetailProduct }
