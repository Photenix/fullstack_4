const { Router } = require('express');
import { getProfile } from "../Controller/access.controller.js";
import { createPurchase, deletePurchase, getPurchaseById, getPurchases, updatePurchase } from "../Controller/compra.controller.js";
import { createSupplier, deleteSupplier, findSupplier, getSupplierById, getSupplierQuantity, getSuppliers, stateSupplier, updateSupplier } from "../Controller/supplier.controller.js";
import { createManyProducts, createProduct, createProductImage, deleteDetailProduct, deleteProduct, deleteProductImage, getProductById, getProductQuantity, getProducts, searchProducts, updateProduct, updateProductDetail } from "../Controller/produt.controller.js";
import { updateRol, getPermissions, getRoles, updatePermissions, createRol, deleteRol, getRole } from "../Controller/rol.controller.js";
import { createUser, deleteUser, findUser, getUserById, getUserQuantity, getUsers, updateUser } from "../Controller/user.controller.js";
import { createCategoria, deleteCategoria, deleteSubcategoria, getCategoriaById, getCategorias, toggleCategoryState, toggleSubcategoryState, updateCategoria, updateSubcategoria } from "../Controller/categoria.controller.js";
import * as devolucionController from "../Controller/devolucion.controller.js";
import * as detalleDevolucionController from "../Controller/detalle.devolucion.controller.js";
import { checkPermissions } from "../Middlewares/rol.mid.js";
import { checkUserPA, checkUserUpdate } from "../Middlewares/user.mid.js";
import { verify, hasPermission } from "../Middlewares/verify.js";
import { checkSupplierCreation } from "../Middlewares/supplier.mid.js";
import { findClient, getClient, getClientQuantity } from "../Controller/client.controller.js";
import { getSellsByUser } from "../Controller/sell.client.controlller.js";
import getDashboard, { getDashboardGeneralInfo, getDashboardSellAndPurchase } from "../Controller/dashboard.controller.js";
import { getSellByUser } from "../Controller/venta.controller.js";
// import { sendReceipt } from "../Controller/order.client.controller.js";

const {
  crearVenta,
} = require("../Controller/venta.controller.js")

const auth = Router()

// Verify the token
auth.use(verify)
// Verify the permissions
auth.use(hasPermission)

// USER
auth.get("/user", getUsers)
auth.get("/user/quantity", getUserQuantity)
auth.get("/user/:id", getUserById)
auth.post("/user/search", findUser)
auth.post("/user", checkUserPA, createUser)
auth.put("/user", checkUserUpdate, updateUser)
auth.delete("/user/:id", deleteUser)

// CLIENT
auth.get('/client', getClient);
auth.get('/client/quantity', getClientQuantity);

auth.post('/client/search', findClient);

// ACCESS
auth.get('/profile', getProfile);
auth.get('/profile/orders', getSellByUser);
auth.get('/profile/sell', getSellsByUser);
auth.get('/profile', getProfile )

auth.get('/profile/dashboard', getDashboard )
auth.get('/profile/dashboard/sell-and-purchase', getDashboardSellAndPurchase )
auth.get('/profile/dashboard/general-info', getDashboardGeneralInfo )

// ROL
auth.get("/rol", getRoles)
auth.get("/rol/:id", getRole)
auth.get("/rol/:name", getPermissions)
auth.post("/rol", createRol)
auth.put("/rol/status", updateRol)
auth.put("/rol/:id", checkPermissions, updatePermissions)
auth.delete("/rol/:id", deleteRol)

// SUPPLIER
auth.get("/supplier", getSuppliers)
auth.get("/supplier/quantity", getSupplierQuantity)
auth.get("/supplier/:id", getSupplierById)
auth.post("/supplier", checkSupplierCreation, createSupplier)
auth.post("/supplier/search", findSupplier)
auth.put("/supplier/:id", updateSupplier)
auth.put("/supplier/status/:id", stateSupplier)
auth.delete("/supplier/:id", deleteSupplier)

// COMPRAS
auth.get("/purchase", getPurchases)
auth.get("/purchase/:id", getPurchaseById)
auth.post("/purchase", createPurchase)
auth.put("/purchase/id", updatePurchase)
auth.delete("/purchase/id", deletePurchase)

// PRODUCT
auth.get("/product", getProducts)
auth.get("/product/quantity", getProductQuantity)
auth.get("/product/:id", getProductById)

auth.post("/product", createProduct)
auth.post("/product/many", createManyProducts)
auth.post("/product/search", searchProducts)
auth.post("/product/img", createProductImage)

auth.put("/product/:id", updateProduct)
auth.put("/product/detail/:id", updateProductDetail)

auth.delete("/product/detail/:id", deleteDetailProduct)
auth.delete("/product/img", deleteProductImage)
auth.delete("/product/:id", deleteProduct)

// CATEGORIES
auth.get("/category", getCategorias)
auth.get("/category/:id", getCategoriaById)
auth.post("/category", createCategoria)
auth.put("/category/:id", updateCategoria)
auth.put("/category/:id/subcategory/:subId", updateSubcategoria)
auth.put("/category/:id/toggle-state", toggleCategoryState)
auth.put("/category/:id/subcategory/:subId/toggle-state", toggleSubcategoryState)

auth.delete('/category/:id', deleteCategoria);
auth.delete('/category/:id/subcategory/:subId', deleteSubcategoria); // Añadida ruta para eliminar subcategorías


// // ORDER
// auth.post('/order/:id', sendReceipt);

// VENTAS
auth.post("/sale", crearVenta)

// DEVOLUCIONES - RUTAS ACTUALIZADAS
auth.post("/devoluciones", devolucionController.crearDevolucion)
auth.get("/devoluciones", devolucionController.obtenerDevoluciones)
auth.get("/devoluciones/:id", devolucionController.obtenerDevolucionPorId)
auth.get("/devoluciones/venta/:ventaId", devolucionController.obtenerDevolucionesPorVenta) // NUEVA RUTA
auth.put("/devoluciones/:id", devolucionController.actualizarDevolucion)
auth.put("/devoluciones/:id/estado", devolucionController.actualizarEstadoDevolucion) // NUEVA RUTA
auth.delete("/devoluciones/:id", devolucionController.eliminarDevolucion)

// DETALLES DEVOLUCIÓN
auth.post("/detalles-devolucion", detalleDevolucionController.crearDetalleDevolucion)
auth.get("/detalles-devolucion/devolucion/:devolucionId", detalleDevolucionController.obtenerDetallesPorDevolucion)
auth.put("/detalles-devolucion/:id", detalleDevolucionController.actualizarDetalleDevolucion)
auth.delete("/detalles-devolucion/:id", detalleDevolucionController.eliminarDetalleDevolucion)

module.exports = auth
