const { Router } = require("express")

// CONTROLADORES
const {
  confirmPIN,
  confirmToken,
  deleteAccount,
  editAccount,
  getPIN,
  getToken,
  logout,
  newPassword,
  resendPIN,
} = require("../Controller/access.controller.js")

const { makeClient } = require("../Middlewares/user.mid.js")

const { createUser } = require("../Controller/user.controller.js")

const {
  clientCreate,
  clientDelete,
  clientFindAll,
  clientFindById,
  clientUpdate,
} = require("../Controller/client.controller.js")

// CORREGIDO: Importar todas las funciones necesarias de venta.controller.js
const {
  actualizarEstadoVenta,
  crearVenta,
  obtenerVenta,
  obtenerVentas,
  obtenerVentasClienteId, // AGREGADO: función movida desde detalleVenta.controller.js
} = require("../Controller/venta.controller.js")

const {
  getCategorias,
  getCategoriaById,
  createCategoria,
  updateCategoria,
  deleteCategoria,
  addSubcategoria,
  updateSubcategoria,
  deleteSubcategoria,
} = require("../Controller/categoria.controller.js")

// CORREGIDO: Importar todas las funciones necesarias de detalleVenta.controller.js
const {
  obtenerDetallesPorVenta,
  crearDetalleVenta,
  actualizarDetalleVenta,
  obtenerDetallePorId, // AGREGADO: función que agregamos
  eliminarDetalleVenta, // AGREGADO: función que agregamos
} = require("../Controller/detalleVenta.controller.js")

const devolucionController = require("../Controller/devolucion.controller.js")
const detalleDevolucionController = require("../Controller/detalle.devolucion.controller.js")

const {
  getPurchases,
  getPurchaseById,
  createPurchase,
  updatePurchase,
  deletePurchase,
  cancelPurchase,
} = require("../Controller/compra.controller.js")
const { getProductsClient } = require("../Controller/product.client.controller.js")

import { sendReceipt, getReceipt } from "../Controller/order.client.controller.js";

const router = Router()

// CLIENT
router.get("/client", clientFindAll)
router.get("/client/:id", clientFindById)
router.post("/client", clientCreate)
router.put("/client/:id", clientUpdate)
router.delete("/client/:id", clientDelete)

// ACCESS

router.get("/user/confirm", confirmToken)
router.post("/login", getToken)
router.post("/logout", logout)
router.post("/register", makeClient, createUser)
router.post("/pin", getPIN)
router.post("/pin/:id", confirmPIN)
router.post("/new-password", newPassword)

router.put("/pin/:id", resendPIN)
router.put("/profile/edit/", editAccount)

router.delete("/account", deleteAccount)

// Vista de productos cliente
router.get("/products", getProductsClient)

// VENTAS
router.get("/ventas", obtenerVentas)
router.get("/ventas/cliente/:clienteId", obtenerVentasClienteId) // CORREGIDO: ahora viene de venta.controller.js
router.get("/ventas/:id", obtenerVenta)

router.post("/ventas", crearVenta)
router.put("/ventas/actualizar-estado/:id", actualizarEstadoVenta) // CORREGIDO: ruta más específica

// DETALLE VENTA
router.get("/detalleVenta/:ventaId", obtenerDetallesPorVenta)
router.get("/detalleVenta/detalle/:id", obtenerDetallePorId) // AGREGADO: nueva ruta

router.post("/detalleVenta", crearDetalleVenta)

router.put("/detalleVenta/:id", actualizarDetalleVenta) // CORREGIDO: agregar :id
router.delete("/detalleVenta/:id", eliminarDetalleVenta) // AGREGADO: ruta para eliminar

// DEVOLUCION
router.get("/devoluciones", devolucionController.obtenerDevoluciones)
router.get("/devoluciones/:id", devolucionController.obtenerDevolucionPorId)

router.post("/devoluciones", devolucionController.crearDevolucion)

router.put("/devoluciones/:id", devolucionController.actualizarDevolucion)

router.delete("/devoluciones/:id", devolucionController.eliminarDevolucion)

// DETALLES DEVOLUCION
router.get("/detalles-devolucion/devolucion/:devolucionId", detalleDevolucionController.obtenerDetallesPorDevolucion)

router.post("/detalles-devolucion", detalleDevolucionController.crearDetalleDevolucion)

router.put("/detalles-devolucion/:id", detalleDevolucionController.actualizarDetalleDevolucion)

router.delete("/detalles-devolucion/:id", detalleDevolucionController.eliminarDetalleDevolucion)

// CATEGORIA
router.get("/categorias", getCategorias)
router.get("/categorias/:id", getCategoriaById)

router.post("/categorias", createCategoria)

router.put("/categorias/:id", updateCategoria)

router.delete("/categorias/:id", deleteCategoria)

// SUBCATEGORIA
router.post("/categorias/:id/subcategorias", addSubcategoria)
router.put("/categorias/:id/subcategorias/:subId", updateSubcategoria)
router.delete("/categorias/:id/subcategorias/:subId", deleteSubcategoria)

// COMPRA
router.get("/compra", getPurchases);
router.get("/compra/:id", getPurchaseById);
router.post("/compra", createPurchase);
router.put("/compra/:id", updatePurchase);
router.patch("/compra/:id/cancel", cancelPurchase);
router.delete("/compra/:id", deletePurchase);

router.post('/order/:id/receipt', sendReceipt);
router.get('/order/:id/receipt', getReceipt);

// EXPORTACIÓN
module.exports = router
