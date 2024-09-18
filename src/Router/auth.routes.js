const { Router } = require('express');
import { getProfile } from "../Controller/access.controller.js";
import { getPermissions, getRoles, updatePermissions } from "../Controller/rol.controller.js";
import { createUser, deleteUser, getUserById, getUsers, updateUser } from "../Controller/user.controller.js";
import { checkPermissions } from "../Middlewares/rol.mid.js";
import { checkUserPA, checkUserUpdate } from "../Middlewares/user.mid.js";
import { verify, hasPermission } from "../Middlewares/verify.js";

const auth = Router()

auth.use( verify )
auth.use( hasPermission )

// USER
auth.get('/user', getUsers)
auth.get('/user/:id', getUserById)
auth.post('/user', checkUserPA, createUser)
auth.put('/user', checkUserUpdate, updateUser)
auth.delete('/user', deleteUser)

// ACCESS
auth.get('/profile', getProfile )

// ROL
auth.get('/rol', getRoles)
auth.get('/rol/:name', getPermissions)
auth.put('/rol', checkPermissions, updatePermissions)


module.exports = auth;