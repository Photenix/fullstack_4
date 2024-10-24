const { Router } = require('express');
import { getProfile } from "../Controller/access.controller.js";
import { createPurchase, deletePurchase, getPurchaseById, getPurchases, updatePurchase } from "../Controller/compra.controller.js";
import { createSupplier, deleteSupplier, getSupplierById, getSuppliers, updateSupplier } from "../Controller/proveedor.controller.js";
import { createProduct, createProductImage, deleteDetailProduct, deleteProduct, getProductById, getProducts, searchProducts, updateProduct } from "../Controller/produt.controller.js";
import { updateRol, getPermissions, getRoles, updatePermissions, createRol, deleteRol } from "../Controller/rol.controller.js";
import { createUser, deleteUser, findUser, getUserById, getUsers, updateUser } from "../Controller/user.controller.js";
import { createCategoria, deleteCategoria, getCategoriaById, getCategorias, updateCategoria } from "../Controller/categoria.controller.js";

import { checkPermissions } from "../Middlewares/rol.mid.js";
import { checkUserPA, checkUserUpdate } from "../Middlewares/user.mid.js";
import { verify, hasPermission } from "../Middlewares/verify.js";

const auth = Router()

auth.use( verify )
//auth.use( hasPermission )

// USER
auth.get('/user', getUsers)
auth.get('/user/:id', getUserById)

auth.post('/user/search', findUser)
auth.post('/user', checkUserPA,createUser)

auth.put('/user', checkUserUpdate, updateUser)
auth.delete('/user/:id', deleteUser)

// ACCESS
auth.get('/profile', getProfile )

// ROL
auth.get('/rol', getRoles)
auth.get('/rol/:name', getPermissions)
auth.post('/rol', createRol)
auth.put('/rol', checkPermissions, updatePermissions)
auth.put('/rol/status', updateRol)
auth.delete('/rol/:id', deleteRol)

//proveedores
auth.get('/supplier', getSuppliers)
auth.get('/supplier/:id', getSupplierById)
auth.post('/supplier', createSupplier)
auth.put('/supplier/:id', updateSupplier)
auth.delete('/supplier/:id', deleteSupplier)

//compras
auth.get('/purchase', getPurchases)
auth.get('/purchase/:id', getPurchaseById)
auth.post('/purchase', createPurchase)
auth.put('/purchase/id', updatePurchase)
auth.delete('/purchase/id', deletePurchase)


// PRODUCT
auth.get('/product', getProducts )
auth.get('/product/:id', getProductById )

auth.post('/product/search', searchProducts )
auth.post('/product', createProduct )
auth.post('/product/img', createProductImage )


auth.put('/product', updateProduct )

auth.delete('/product/:id', deleteProduct )
auth.delete('/product/detail', deleteDetailProduct )

// CATEGORIES
auth.get('/category', getCategorias);
auth.get('/category/:id', getCategoriaById);

auth.post('/category', createCategoria);

auth.put('/category/:id', updateCategoria);
auth.delete('/category/:id', deleteCategoria);

module.exports = auth;