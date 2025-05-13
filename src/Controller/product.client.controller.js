import Products from "../Models/Products";
import { filteringProductsOptions, getCategories } from "../Tools/product.tool";


const getProductsClient = async ( req, res ) =>{
  try{
      
    const listCategories = await getCategories()
    //get 10 products by default
    const { limit = 10, page = 1 } = req.query
    // const limit = req.query.limit || 10
    // const page = req.query.page || 1
    const offset = (page - 1)  * limit

    let query =  filteringProductsOptions( req )

    //solo se muestran productos activos
    query["state"] = true

    // console.log( query );
    
    
    const products = await Products.find( query ).skip(offset).limit(limit);

    let cleanProduct = products.map(product => {
        return {
            ...product._doc,
            category: listCategories[product.category] || "Camisa"
        }
    })

    return res.status(200).json({ data: cleanProduct, success: true });
  }
  catch(e){
    return res.status(500).json({ message: 'Error al obtener los productos', error: e.message, success: false });
  }
}

export { getProductsClient }