import Products from "../Models/Products";
import validateInformationField from "../Tools/creation.tool";
import { v2 as cloudinary } from 'cloudinary';
import { getCategories } from "../Tools/product.tool";
import Purchase from "../Models/compra";
import Venta from "../Models/ventaModel";

const PRODUCT_VALUES = [
    "name", "totalQuantity",
    "category", "classification", "details",
    "description", "images"
    // "name", "price", "totalQuantity", "color",
]

cloudinary.config({ 
    cloud_name: 'photenix', 
    api_key: '192637173257687', 
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const getProductQuantity = async (req, res) => {
    try {
        const count = await Products.countDocuments({})
        return res.status(200).json({ quantity: count, success: true });
    } catch (error) {
        console.log( error );
        res.status(500).json({ message: error.message, success: false });
    }
}

const getProducts = async ( req, res ) =>{
    try{
        
        const listCategories = await getCategories()
        //get 10 products by default
        const limit = req.query.limit || 10
        const page = req.query.page || 1
        const offset = (page - 1)  * limit

        const classification = req.query.classification || ""

        let products
        
        /*
        if( classification !== ""){
            products = await Products.find({ classification: classification }).skip(offset).limit(limit);
        }
        */

        products = await Products.find().skip(offset).limit(limit);

        let cleanProduct = products.map(product => {
            return {
                ...product._doc,
                category: listCategories[product.category] || "Camisa"
            }
        })

        res.status(200).json({ data: cleanProduct, success: true });
    }
    catch(e){
        res.status(500).json({ message: 'Error al obtener los productos', error: e.message, success: false });
    }
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
    try{
        const { find } = req.body

        const listCategories = await getCategories()

        // Construir la consulta
        
        const query = {
            $or: [
                { name: { $regex: `^${find}.*`, $options: 'i' } }, // Buscar por nombre
                { details: { $elemMatch: { barcode: { $regex: `^${find}.*`, $options: 'i' } } } } // Buscar en detalles
            ]
        };

        // const query = { name: { $regex: `^${find}.*`, $options: 'i' } }

        const products = await Products.find(query).lean();

        let cleanProduct = products.map(product => {
            return {
                ...product,
                category: listCategories[product.category] || "Camisa"
            }
        })

        return res.status(200).json({ data: cleanProduct, success: true });
    }
    catch(e){
        return res.status(500).json({ message: 'Error al buscar productos', error: e.message, success: false });
    }
}

const createManyProducts = async ( req, res ) => {
    try{
        const { products } = req.body
        const newProducts = await Products.insertMany(products);
        return res.status(200).json({ message: 'Productos creados correctamente', data: newProducts, success: true });
    }
    catch(e){
        if( e.code === 11000 ){
            return res.status(400).json({ message:'En el csv hay productos existentes en stock que tienen el mismo nombre', success: false })
        }
        return res.status(500).json({ message: 'Error al crear los productos', error: e.message, success: false });
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
        return res.status(200).json({ message: 'Producto creado correctamente', data: product, success: true });
    }
    catch(e){
        // console.log( e );
        if( e.code === 11000 ){
            return res.status(400).json({ message:'Ya existe un producto con ese nombre', success: false })
        }
        return res.status(500).json({ message: 'Error al crear el producto', error: e.message, success: false });
    }
}

const createProductImage = async ( req, res ) => {
    try {
        const fileStr = req.body.data;
        const uploadResponse = await cloudinary.uploader.upload(fileStr, {
            upload_preset: 'ml_default',
            folder: 'Boutique'
        });
        console.log(uploadResponse);
        return res.status(200).json({ msg: 'created image', img: uploadResponse.url });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ err: 'Something went wrong' });
    }
}

const updateProduct = async ( req, res ) => {
    try{
        const id = await Products.findById(req.params.id);
        const { changes } = req.body;
        /*
        if( changes.details !== undefined  && changes?.details.length !== 0 ){
            if( changes.details.length > 1 ){
                //intera mas de un detalle de producto
                await Products.findByIdAndUpdate(id, { $push: { details: { $each: changes.details } } });
            }
            //solo ingresa un detalle de producto
            else await Products.findByIdAndUpdate(id, { $push: { details: changes.details } });
            delete changes.details
        }
        */
        // new true para que me devuelva el producto actualizado
        const product = await Products.findByIdAndUpdate(id, changes, { new: true });
        return res.status(200).json({ message: 'Producto actualizado correctamente', data: product, success: true });
    }
    catch(e){
        return res.status(500).json({ message: 'Error al actualizar el producto', error: e.message, success: false });
    }
}

const updateProductDetail = async ( req, res ) => {
    try{
        const { id } = req.params;
        const { changes } = req.body;
        // new true para que me devuelva el producto actualizado
        const product = await Products.findOneAndUpdate({ details: { $elemMatch: { _id: id } } }, { $set: changes }, { new: true });

        return res.status(200).json({ message: 'Detalle de producto actualizado correctamente', data: product, success: true });
    }
    catch(e){
        return res.status(500).json({ message: 'Error al actualizar el producto', error: e.message, success: false });
    }
}



const deleteProduct = async ( req, res ) => {
    try{
        const { id } = req.params;
        const InfoProduct = await Products.findById(id).lean();
        const detailsId = InfoProduct.details.map( detail => detail._id )
        
        //check if not exist id details on purchase        
        const purchase = await Purchase.findOne({ "products.productId":  id  })
        const sell = await Venta.findOne({
            "productos.productoId": { $in: detailsId }
        })
        
        if( purchase || sell ){
            return res.status(400).json({ message: 'No se puede eliminar el producto porque está asociado a una compra/venta', success: false });
        }
        
        const product = await Products.findByIdAndDelete(id);
        
        res.json({ message: 'Producto eliminado correctamente', data: product, success: true });
        // res.json({ message: 'Producto eliminado correctamente', data: product, success: true });
    }
    catch(e){
        return res.status(500).json({ message: 'Error al eliminar el producto', error: e.message, success: false });
    }
}

const deleteDetailProduct = async ( req, res ) => {
    try{
        //id of detail product
        const { id } = req.params;
        //! add quality of don note delete if on purchase or order is present
        //the $pull operator removes all instances of a specified value from an array
        // const product = await Products.findByIdAndUpdate({ "details._id": id }, { $pull: { details: { _id: id } } });
        const product = await Products.findOneAndUpdate({ "details._id": id }, { $pull: { details: { _id: id } } }, { new: true });
        return res.json({ message: 'Detalle eliminado correctamente', data: product, success: true });
    }
    catch(e){
        console.log( e );
        
        return res.status(500).json({ message: 'Error al eliminar el detalle', error: e.message, success: false });
    }
}

const deleteProductImage = async (req, res) => {
    try {
        // Obtener el public_id de la imagen a eliminar
        // Puedes recibirlo en el body, params o query según tu preferencia
        const { id } = req.body;
        
        if (!id) return res.status(400).json({ message: 'Public ID is required', success: false });

        // Eliminar la imagen de Cloudinary
        const deleteResponse = await cloudinary.uploader.destroy( id );

        // Verificar si la eliminación fue exitosa
        if (deleteResponse.result === 'ok') {
            return res.status(200).json({ message: 'Imagen fue eliminada con exito', success: true });
        } else {
            console.log( deleteResponse );
            
            return res.status(400).json({ message: 'No se pudo eliminar la imagen', success: false });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Something went wrong', success: false });
    }
}



export { 
    getProductQuantity, getProducts, getProductById, searchProducts, createManyProducts,
    createProduct, createProductImage, updateProduct, updateProductDetail, deleteProduct, deleteDetailProduct, deleteProductImage }
