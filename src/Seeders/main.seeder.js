require('../conn');
require('dotenv').config()

import { adminUser, workersUsers, } from './User.seeder';
import { rolAdmin, rolWorker, getRol } from './Rol.seeder';

const mainSeeder = async () => {
    await rolAdmin()
    await rolWorker()
    const idRol = await getRol("Admin")
    await adminUser( idRol )
    const idRolWorker = await getRol("Worker")
    await workersUsers( idRolWorker )
}

mainSeeder()