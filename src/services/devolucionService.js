// services/devolucionService.js

const Venta = require('../Models/ventaModel');
const Product = require('../Models/Products');
const DetalleVenta = require('../Models/detalleVentaModel');
const { default: Products } = require('../Models/Products');
const { updateProductDetail } = require('../Tools/product.tool');

/**
 * Procesa una devolución completa:
 * 1. Cancela la venta original
 * 2. Crea una nueva venta con productos no devueltos
 * 3. Actualiza el stock de productos devueltos
 * 
 * @param {Object} ventaOriginal - Documento de la venta original
 * @param {Array} productosDevueltos - Array de productos a devolver
 * @param {String} devolucionId - ID de la devolución creada
 * @returns {Object} Resultado del procesamiento
 */
const procesarDevolucion = async (ventaOriginal, productosDevueltos, devolucionId) => {
  try {
    // 2. Identificar productos que NO fueron devueltos (para la nueva venta)
    let productosNoDevueltos = identificarProductosNoDevueltos(
      ventaOriginal.productos,
      productosDevueltos
    );
    productosNoDevueltos = productosNoDevueltos.filter( e => e !== null )

    // 3. Crear nueva venta solo si hay productos no devueltos
    let nuevaVenta = null;
    if (productosNoDevueltos.length > 0) {
      nuevaVenta = await crearNuevaVenta(ventaOriginal, productosNoDevueltos);
    } else {
      // console.log('No hay productos para crear nueva venta');
    }

    // 4. Actualizar stock de productos devueltos
    const stockActualizado = await updateReturnProducts(productosDevueltos);
    // console.log('Stock actualizado para', stockActualizado.length, 'productos');


    // 1. Cancelar la venta original
    const ventaCancelada = await Venta.findByIdAndUpdate(
      ventaOriginal._id,
      { estado: 'cancelado' },
      { new: true }
    );

    if (!ventaCancelada) {
      throw new Error(`No se pudo cancelar la venta ${ventaOriginal._id}`);
    }

    return {
      ventaCancelada,
      nuevaVenta,
      stockActualizado
    };
  } catch (error) {
    console.error('Error en procesarDevolucion:', error);
    throw error;
  }
};

/**
 * Identifica los productos que no fueron devueltos
 * 
 * @param {Array} productosOriginales - Productos de la venta original
 * @param {Array} productosDevueltos - Productos que se están devolviendo
 * @returns {Array} Productos no devueltos o con cantidad parcial
 */
const identificarProductosNoDevueltos = (productosOriginales, productosDevueltos) => {
  try {    
    return productosOriginales.map(producto => {
      // Buscar si hay una devolución para este producto
      const devolucion = productosDevueltos.find(d => 
        d.productoId.toString() === producto.productoId.toString()
      );
            
      let nuevaCantidad = producto.cantidad

      if (devolucion) {
        // Reducir la cantidad
        nuevaCantidad = producto.cantidad - devolucion.cantidad;
        if( nuevaCantidad == 0 ){
          return null
        }
      }

      producto.cantidad = nuevaCantidad;
      
      // Si no hay devolución, mantener el producto igual
      return producto;
    });
  } catch (error) {
    console.error('Error en identificarProductosNoDevueltos:', error);
    throw error;
  }
};

/**
 * Crea una nueva venta con los productos no devueltos
 * 
 * @param {Object} ventaOriginal - Venta original
 * @param {Array} productosNoDevueltos - Productos para la nueva venta
 * @returns {Object} Nueva venta creada
 */
const crearNuevaVenta = async (ventaOriginal, productosNoDevueltos) => {
  try {
    // Calcular el nuevo total basado en los productos no devueltos
    const nuevoTotal = productosNoDevueltos.reduce(
      (total, producto) => total + (producto.precio * producto.cantidad),
      0
    );
    
    // Crear objeto de nueva venta
    const nuevaVenta = new Venta({
      cliente: ventaOriginal.cliente,
      estado: 'pendiente',
      fecha: new Date(),
      direccion: ventaOriginal.direccion,
      ciudad: ventaOriginal.ciudad,
      total: nuevoTotal,
      productos: productosNoDevueltos.map(producto => ({
        productoId: producto.productoId,
        nombre: producto.nombre,
        cantidad: producto.cantidad,
        precio: producto.precio
      }))
    });
    
    // Guardar la nueva venta
    const ventaGuardada = await nuevaVenta.save();
    
    // Crear detalles de venta para la nueva venta
    if (ventaGuardada) {
      const detalles = productosNoDevueltos.map(producto => ({
        ventaId: ventaGuardada._id,
        productoId: producto.productoId,
        nombreProducto: producto.nombre,
        cantidad: producto.cantidad,
        precio: producto.precio
      }));
      
      await DetalleVenta.insertMany(detalles);
    }
    
    return ventaGuardada;
  } catch (error) {
    console.error('Error en crearNuevaVenta:', error);
    throw error;
  }
};

/**
 * Actualiza el stock de los productos devueltos
 * 
 * @param {Array} productosDevueltos - Productos a devolver
 * @returns {Array} Resultado de las actualizaciones
 */
const updateReturnProducts = async (productosDevueltos) => {
  try {
    const resultados = [];
    
    // Procesar cada producto devuelto
    for (const productoDevuelto of productosDevueltos) {
      try {
        // 1. Buscar el producto y sus detalles
        const producto = await Products.findOne({ "details._id": productoDevuelto.productoId });
        if (!producto) {
          console.warn(`Producto no encontrado: ${productoDevuelto.productoId}`);
          resultados.push({
            productoId: productoDevuelto.productoId,
            exito: false,
            mensaje: 'Producto no encontrado'
          });
          continue;
        }
        
        // 2. Encontrar el detalle correcto (por tamaño u otra propiedad)
        // Nota: Aquí asumimos que el primer detalle es el correcto
        // En un sistema real, deberías buscar por tamaño, color u otra propiedad
        if (!producto.details || producto.details.length === 0) {
          console.warn(`Producto sin detalles: ${productoDevuelto.productoId}`);
          resultados.push({
            productoId: productoDevuelto.productoId,
            exito: false,
            mensaje: 'Producto sin detalles'
          });
          continue;
        }

        const detalle = producto.details.filter( detail => detail._id.equals(productoDevuelto.productoId) )[0];

        // 3. Actualizar la cantidad en el detalle
        const nuevaCantidad = detalle.quantity + productoDevuelto.cantidad;
        
        // 4. Actualizar el detalle del producto
        // const updateData = {
        //   ...detalle.toObject(),
        //   quantity: nuevaCantidad
        // };
        
        // // Usar la función updateProductDetail para actualizar el detalle
        // const productoActualizado = await updateProductDetail(detalle._id, updateData);

        detalle.quantity = nuevaCantidad
        delete detalle._id

        const productoActualizado = await updateProductDetail( detalle._id, detalle );
        
        if (productoActualizado) {
          resultados.push({
            productoId: productoDevuelto.productoId,
            detalleId: detalle._id,
            cantidadAnterior: detalle.quantity,
            cantidadNueva: nuevaCantidad,
            exito: true
          });
        } else {
          resultados.push({
            productoId: productoDevuelto.productoId,
            detalleId: detalle._id,
            exito: false,
            mensaje: 'Error al actualizar el stock'
          });
        }
      } catch (error) {
        console.error(`Error al procesar producto ${productoDevuelto.productoId}:`, error);
        resultados.push({
          productoId: productoDevuelto.productoId,
          exito: false,
          mensaje: error.message
        });
      }
    }
    
    return resultados;
  } catch (error) {
    console.error('Error en actualizarStockProductosDevueltos:', error);
    throw error;
  }
};

module.exports = {
  procesarDevolucion,
  updateReturnProducts,
};