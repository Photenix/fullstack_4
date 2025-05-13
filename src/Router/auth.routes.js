const { Router } = require('express');
import { getProfile } from "../Controller/access.controller.js";
import { createPurchase, deletePurchase, getPurchaseById, getPurchases, updatePurchase } from "../Controller/compra.controller.js";
import { createSupplier, deleteSupplier, findSupplier, getSupplierById, getSupplierQuantity, getSuppliers, stateSupplier, updateSupplier } from "../Controller/supplier.controller.js";
import { createManyProducts, createProduct, createProductImage, deleteDetailProduct, deleteProduct, getProductById, getProductQuantity, getProducts, searchProducts, updateProduct } from "../Controller/produt.controller.js";
import { updateRol, getPermissions, getRoles, updatePermissions, createRol, deleteRol, getRole } from "../Controller/rol.controller.js";
import { createUser, deleteUser, findUser, getUserById, getUserQuantity, getUsers, updateUser } from "../Controller/user.controller.js";
import { createCategoria, deleteCategoria, getCategoriaById, getCategorias, updateCategoria } from "../Controller/categoria.controller.js";
import { obtenerDescuentos, obtenerDescuentosPorProducto, crearDescuento, actualizarDescuento, eliminarDescuento } from "../Controller/descuento.Controller.js";

import { checkPermissions } from "../Middlewares/rol.mid.js";
import { checkUserPA, checkUserUpdate } from "../Middlewares/user.mid.js";
import { verify, hasPermission } from "../Middlewares/verify.js";
import { checkSupplierCreation } from "../Middlewares/supplier.mid.js";
import { crearDetalleDevolucion, obtenerDetallesPorDevolucion } from "../Controller/detalle.devolucion.controller.js";
import { procesarDevolucion } from "../Controller/devolucion.controller.js";
import { getClient, getClientQuantity } from "../Controller/client.controller.js";


const auth = Router()

//verify the token
auth.use( verify )
//verify the permissions
auth.use( hasPermission )


// USER
auth.get('/user', getUsers)
auth.get('/user/quantity', getUserQuantity)
auth.get('/user/:id', getUserById)

auth.post('/user/search', findUser)
auth.post('/user', checkUserPA,createUser)


auth.put('/user', checkUserUpdate, updateUser)
auth.delete('/user/:id', deleteUser)

//CLIENT
auth.get('/client', getClient)
auth.get('/client/quantity', getClientQuantity)


// ACCESS
auth.get('/profile', getProfile )


// ROL
auth.get('/rol', getRoles)
auth.get('/rol/:id', getRole)
auth.get('/rol/:name', getPermissions)

auth.post('/rol', createRol)

auth.put('/rol/status', updateRol)
auth.put('/rol/:id', checkPermissions, updatePermissions)

auth.delete('/rol/:id', deleteRol)

//SUPPLIER
auth.get('/supplier', getSuppliers)
auth.get('/supplier/quantity', getSupplierQuantity)
auth.get('/supplier/:id', getSupplierById)

auth.post('/supplier', checkSupplierCreation, createSupplier)
auth.post('/supplier/search', findSupplier)

auth.put('/supplier/:id', updateSupplier)
//change state of supplier
auth.put('/supplier/status/:id', stateSupplier)

auth.delete('/supplier/:id', deleteSupplier)


//compras
auth.get('/purchase', getPurchases)
auth.get('/purchase/:id', getPurchaseById)
auth.post('/purchase', createPurchase)
auth.put('/purchase/id', updatePurchase)
auth.delete('/purchase/id', deletePurchase)


// PRODUCT
auth.get('/product', getProducts )
auth.get('/product/quantity', getProductQuantity )
auth.get('/product/:id', getProductById )

auth.post('/product', createProduct )
auth.post('/product/many', createManyProducts )
auth.post('/product/search', searchProducts )
auth.post('/product/img', createProductImage )

auth.put('/product/:id', updateProduct )

auth.delete('/product/detail/:id', deleteDetailProduct )
auth.delete('/product/:id', deleteProduct )


// CATEGORIES
auth.get('/category', getCategorias);
auth.get('/category/:id', getCategoriaById);


auth.post('/category', createCategoria);


auth.put('/category/:id', updateCategoria);
auth.delete('/category/:id', deleteCategoria);

//DEVOLUCION
auth.post('/devolucion', crearDetalleDevolucion);
// auth.get('/devolucion', obtenerDetallesDevoluciones);
auth.get('/devolucion/:devolucionId', obtenerDetallesPorDevolucion);
// auth.get('/:id', obtenerDetalleDevolucionPorId);
// auth.put('/:id', actualizarDetalleDevolucion);
auth.post('/:id/procesar', procesarDevolucion); // Nueva ruta para procesar la devolución

//DESCUENTOS
auth.get('/descuentos', obtenerDescuentos);
auth.get('/descuentos/producto/:productoId', obtenerDescuentosPorProducto);
auth.post('/descuentos', crearDescuento);
auth.put('/descuentos/:id', actualizarDescuento);
auth.delete('/descuentos/:id', eliminarDescuento);


module.exports = auth;