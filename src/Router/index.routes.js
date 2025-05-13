import { Router } from "express";
import {
  confirmPIN,
  confirmToken,
  deleteAccount,
  editAccount,
  getPIN,
  getToken,
  logout,
  newPassword,
  resendPIN,
} from "../Controller/access.controller.js";
import { checkUserPA, makeClient } from "../Middlewares/user.mid.js";
import { createUser, getUsers } from "../Controller/user.controller.js";
import {
  clientCreate,
  clientDelete,
  clientFindAll,
  clientFindById,
  clientUpdate,
} from "../Controller/client.controller.js";
import { crearVenta, obtenerVentas } from "../Controller/venta.controller.js";
import {
  getCategorias,
  getCategoriaById,
  createCategoria,
  updateCategoria,
  deleteCategoria,
  addSubcategoria,
  updateSubcategoria,
  deleteSubcategoria,
} from "../Controller/categoria.controller.js";


import {
  // actualizarDevolucion,
  crearDevolucion,
  eliminarDevolucion,
  obtenerDevoluciones,
} from "../Controller/devolucion.controller.js";

import {
  getPurchases,
  getPurchaseById,
  createPurchase,
  updatePurchase,
  deletePurchase,
  cancelPurchase 
} from "../Controller/compra.controller.js";
import { getProductsClient } from "../Controller/product.client.controller.js";
import {
  obtenerDetallesVenta,
  obtenerDetallesPorVenta,
  crearDetalleVenta,
  actualizarDetalleVenta,
  // eliminarDetalleVenta
} from "../Controller/detalleventa.controller.js";

const router = Router();

// CLIENT
router.get("/client", clientFindAll);
router.get("/client/:id", clientFindById);
router.post("/client", clientCreate);
router.put("/client/:id", clientUpdate);
router.delete("/client/:id", clientDelete);

//ACCESS
//confirm if the user is authenticated
router.get("/user/confirm", confirmToken);
// router.get("/user", getUsers);

router.post("/login", getToken);
router.post('/logout', logout)

router.post("/register", makeClient, createUser);

router.post("/pin", getPIN);
router.post("/pin/:id", confirmPIN);
router.post("/new-password/", newPassword);

router.put("/pin/:id", resendPIN);
router.put("/profile/edit/", editAccount)

router.delete("/account", deleteAccount);


// Vista de productos cliente
router.get("/products", getProductsClient);

// CATEGORIES
router.get('/category', getCategorias);

//ARIANA

//ventas: no delete ni update
router.post("/ventas", crearVenta);
router.get("/ventas", obtenerVentas);

//detalle venta
router.post("/detalleVenta", crearDetalleVenta);
router.get("/detalleVenta", obtenerDetallesPorVenta);
router.put("/detalleVenta", actualizarDetalleVenta);
// router.delete("/detalleVenta", eliminarDetalleVenta);

//devolucion
router.post("/devolucion", crearDevolucion);
router.get("/devolucion", obtenerDevoluciones);
// router.put("/devolucion", actualizarDevolucion);
router.delete("/devolucion", eliminarDevolucion);

//Categoria
router.get("/categorias", getCategorias);
router.get("/categorias/:id", getCategoriaById);
router.post("/categorias", createCategoria);
router.put("/categorias/:id", updateCategoria);
router.delete("/categorias/:id", deleteCategoria);

//Subcategoria
router.post("/categorias/:id/subcategorias", addSubcategoria); // Añadir subcategoría
router.put("/categorias/:id/subcategorias/:subId", updateSubcategoria);
router.delete("/categorias/:id/subcategorias/:subId", deleteSubcategoria); // Eliminar subcategoría

router.get("/compra", getPurchases);
router.get("/compra/:id", getPurchaseById);
router.post("/compra", createPurchase);
router.put("/compra/:id", updatePurchase); // Modificado para incluir :id
router.patch("/compra/:id/cancel", cancelPurchase); // Nueva ruta
router.delete("/compra/:id", deletePurchase);

module.exports = router;
