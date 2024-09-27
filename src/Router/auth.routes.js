const { Router } = require('express');
import { getProfile } from "../Controller/access.controller.js";
import { createProduct, deleteDetailProduct, deleteProduct, getProductById, getProducts, updateProduct } from "../Controller/produt.controller.js";
import { updateRol, getPermissions, getRoles, updatePermissions } from "../Controller/rol.controller.js";
import { createUser, deleteUser, findUser, getUserById, getUsers, updateUser } from "../Controller/user.controller.js";
import { createCategoria, deleteCategoria, getCategoriaById, getCategorias, updateCategoria } from "../Controller/categoria.controller.js";

import { checkPermissions } from "../Middlewares/rol.mid.js";
import { checkUserPA, checkUserUpdate } from "../Middlewares/user.mid.js";
import { verify, hasPermission } from "../Middlewares/verify.js";

const auth = Router()

auth.use( verify )
auth.use( hasPermission )

// USER
auth.get('/user', getUsers)
auth.get('/user/:id', getUserById)

auth.post('/user/search', findUser)
auth.post('/user', checkUserPA,createUser)

auth.put('/user', checkUserUpdate, updateUser)
auth.delete('/user', deleteUser)

// ACCESS
auth.get('/profile', getProfile )

// ROL
auth.get('/rol', getRoles)
auth.get('/rol/:name', getPermissions)
auth.put('/rol', checkPermissions, updatePermissions)
auth.put('/rol/status', updateRol )

// PRODUCT
auth.get('/product', getProducts )
auth.get('/product/:id', getProductById )

auth.post('/product', createProduct )
auth.put('/product', updateProduct )

auth.delete('/product', deleteProduct )
auth.delete('/product/detail', deleteDetailProduct )

// CATEGORIES
auth.get('/category', getCategorias);
auth.get('/category/:id', getCategoriaById);

auth.post('/category', createCategoria);

auth.put('/category/:id', updateCategoria);
auth.delete('/category/:id', deleteCategoria);

module.exports = auth;