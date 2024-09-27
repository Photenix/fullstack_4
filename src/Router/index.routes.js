import { Router } from "express";
import { confirmToken, deleteAcount, getPIN, getToken, newPassword } from "../Controller/access.controller.js";
import { checkUserPA, makeClient } from "../Middlewares/user.mid.js";
import { createUser, getUsers } from "../Controller/user.controller.js";
import { clientCreate, clientDelete, clientFindAll, clientFindById, clientUpdate, clientViewUpdate } from "../Controller/client.controller.js";
import { crearVenta, obtenerVentas } from "../Controller/ventaController.js";
import { crearDetallePedido, eliminarDetallePedido, obtenerDetallesPedido } from "../Controller/detallePedidoController.js";
import { actualizarDetalleVenta, crearDetalleVenta, eliminarDetalleVenta, obtenerDetallesVenta, obtenerDetalleVentaPorId } from "../Controller/detalleVentaController.js";
import { actualizarPedido, crearPedido, eliminarPedido, obtenerPedidos } from "../Controller/pedidoController.js";
import { actualizarDevolucion, crearDevolucion, eliminarDevolucion, obtenerDevoluciones } from "../Controller/devolucionController.js";


const router = Router()

// CLIENT
router.get('/client', clientFindAll);
router.get('/client/:id', clientFindById);
router.post('/addClient', clientCreate);
router.get('/upClient/:id', clientViewUpdate);
router.post('/upClient/:id', clientUpdate);
router.post('/deleteClient/:id', clientDelete);

//ACCESS
router.post('/login', getToken )

router.post('/register', makeClient, createUser)

router.post('/pin', getPIN)
router.post('/new-password/:id', newPassword)

router.get('/user/confirm', confirmToken )

router.delete('/acount', deleteAcount )

router.get('/user', getUsers)

//ARIANA

//ventas: no delete ni update
router.post('/ventas', crearVenta);
router.get('/ventas', obtenerVentas);



//detalle venta
router.post('/detalleVenta', crearDetalleVenta);
router.get('/detalleVenta', obtenerDetallesVenta);
router.put('/detalleVenta',actualizarDetalleVenta);
router.delete('/detalleVenta',eliminarDetalleVenta);



//pedido
router.get('/pedido', obtenerPedidos);
router.post('/pedido', crearPedido);
router.put('/pedido', actualizarPedido);
router.delete('/pedido', eliminarPedido);


//detalle pedido
router.post('/detallePedido', crearDetallePedido);
router.get('/detallePedido', obtenerDetallesPedido);
router.delete('/detallePedido', eliminarDetallePedido);


//devolucion
router.post('/devolucion', crearDevolucion);
router.get('/devolucion', obtenerDevoluciones);
router.put('/devolucion', actualizarDevolucion);
router.delete('/devolucion', eliminarDevolucion);



module.exports = router
