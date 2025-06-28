require('dotenv').config()
require('../conn');

import { adminUser, AnonClientUser, workersUsers, } from './User.seeder';
import { rolAdmin, rolWorker, getRol, rolClient } from './Rol.seeder';
console.log(process.env.MONGO + process.env.DB)
const mainSeeder = async () => {
    await rolAdmin()
    await rolWorker()
    await rolClient()
    const idRol = await getRol("Admin")
    await adminUser( idRol )
    // const idRolWorker = await getRol("Worker")
    // await workersUsers( idRolWorker )
    const idRolClient = await getRol("Client")
    await AnonClientUser( idRolClient )
}

mainSeeder()