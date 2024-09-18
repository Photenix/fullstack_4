import { Router } from "express";
import { clientCreate, clientDelete, clientFindAll, clientFindById, clientUpdate, clientViewUpdate } from "../Controller/client.controller.js";
import { createUser } from "../Controller/user.controller.js";
import { confirmToken, getToken } from "../Controller/access.controller.js";
import { checkUserPA } from "../Middlewares/user.mid.js";


const router = Router()

// router.get('/', (req, res) => {
//     // res.send("hi")
//     res.render('index')
// })


// CLIENT
router.get('/client', clientFindAll )
router.get('/client/:id', clientFindById )
router.post('/addClient', clientCreate )
router.get('/upClient/:id', clientViewUpdate)
router.post('/upClient/:id', clientUpdate)
router.post('/deleteClient/:id', clientDelete )

//ACCESS
router.post('/login', getToken )
router.post('/register', checkUserPA, createUser)
router.get('/user/confirm', confirmToken )

module.exports = router