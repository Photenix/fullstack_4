import Products from '../Models/Products';

const Categoria = require('../Models/categoria'); // Importar el modelo de Categoria

const getCategories = async ( name ) => {
  const categories = await Categoria.find({}, 'nombre _id').lean();
  let listCategories = {}
  categories.forEach(category => {
    listCategories[category._id] = category.nombre
  })
  return listCategories;
}

//entrega los filtros de los productos para su utilización
const filteringProductsOptions = ( req ) => {
  let listFilteringOptions = [ "classification", "category", "name", "minPrice", "maxPrice", "size", "offer"]

  let $and = {}

  for (let i = 0; i < listFilteringOptions.length; i++) {
    const element = listFilteringOptions[i];
    
    let option = req.query[element] || ""

    if( option !== "" ) {
      if( element === "minPrice" || element === "maxPrice" ){
        option = Number(option)
        if( element === "minPrice" ) $and["details.price"] = { $gte: option }
        if (element === "maxPrice") $and["details.price"] = { $lte: option }
        continue
      }
      if( element === "offer" ){
        option = Number(option)
        option = option < 0 ? 0 : option
        $and["details.discount"] = { $gte: option }
        continue
      }
      if( element === "name" ) option = { $regex: `^${option}.*`, $options: 'i' }
      if( element === "size" ){
        option = { $regex: `^${option}.*`, $options: 'i' }
        $and["details"] = { $elemMatch: { size: option } }
      }
      else $and[element] = option
    }
  }
  
  return $and
}

/**
 * 
 * @param {*} idDetail es el _id de detalle producto NO de producto
 * @param {*} updateData son los campos que se van a actualizar como pueden ser precio de compra, precio, descuento o cantidad (los nombres  son en ingles mirar en modelo)
 * @returns si devuelve un objeto el producto actualizo con existo si no devuelve null
 */
const updateProductDetail = async ( idDetail, updateData ) => {
  try{
    const product = await Products.findOneAndUpdate(
      { "details._id": idDetail }, // Buscar el producto y el detalle
      { $set: { "details.$": updateData } }, // Usar $set para actualizar el detalle
      { new: true } // Devolver el documento actualizado
    );
    return product
  }
  catch(e){
    console.log(e);
    return null
  }
}

export { getCategories, filteringProductsOptions, updateProductDetail }