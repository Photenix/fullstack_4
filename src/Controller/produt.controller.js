import Products from "../Models/Products";
import validateInformationField from "../Tools/creation.tool";

const PRODUCT_VALUES = [
    "name", "price", "totalQuantity",
    "category", "classification", "details"
]

const getProducts = async ( req, res ) =>{
    const products = await Products.find();
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

const createProduct = async ( req, res ) => {
    try{
        const [ succes, message, info ] = validateInformationField( PRODUCT_VALUES, req.body )
        //return a status error user
        if( succes === false ) return res.status(400).json({ message, success: false });

        if( info.details.length === 0 ) return res.status(400).json({ message: "Not exist detail, min detail is 1", success: false });

        const product = new Products(info);
        await product.save();
        res.json({ message: 'Producto creado correctamente', data: product, success: true });
    }
    catch(e){
        res.json({ message: 'Error al crear el producto', error: e.message, success: false });
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
        res.json({ message: 'Producto actualizado correctamente', data: "product", success: true });
    }
    catch(e){
        res.json({ message: 'Error al actualizar el producto', error: e.message, success: false });
    }
}

const deleteProduct = async ( req, res ) => {
    const { id } = req.body;
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

export { getProducts, getProductById, createProduct, updateProduct, deleteProduct, deleteDetailProduct }