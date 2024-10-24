require('dotenv').config()
require('../conn');

import { adminUser, workersUsers, } from './User.seeder';
import { rolAdmin, rolWorker, getRol, rolClient } from './Rol.seeder';
console.log(process.env.MONGO + process.env.DB)
const mainSeeder = async () => {
    await rolAdmin()
    await rolWorker()
    await rolClient()
    const idRol = await getRol("Admin")
    await adminUser( idRol )
    const idRolWorker = await getRol("Worker")
    await workersUsers( idRolWorker )
}

mainSeeder()