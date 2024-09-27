import { Schema, model } from "mongoose";

const defPrivileges = {
    read : true,
    create : false,
    update : false,
    delete : false,
    download : false,
}

//The privileges
const privilegesSchema = new Schema({
    read : Boolean,
    create: Boolean,
    update : Boolean,
    delete : Boolean,
    download : Boolean,
},{_id: false})

//The permissions are the modules of role, user, access, shopping, supplier, product, client, productOrder, sale, 
const permissionsSchema = new Schema({
    rol: { type: privilegesSchema, required: true, description: 'The user has access to module rol' },

    user: { type: privilegesSchema, required: true, description: 'The user has access to module users' },
    
    access: { type: privilegesSchema, required: true, description: 'The user has access to module access' },

    shopping: { type: privilegesSchema, required: true, description: 'The user has access to module shopping' },

    supplier: { type: privilegesSchema, required: true, description: 'The user has access to module supplier' },

    category: { type: privilegesSchema, required: true, description: 'The user has access to module supplier' },

    product: { type: privilegesSchema, required: true, description: 'The user has access to module product' },

    client: { type: privilegesSchema, required: true, description: 'The user has access to module client' },

    productOrder: { type: privilegesSchema, required: true, description: 'The user has access to module productOrder' },

    sale: { type: privilegesSchema, required: true, description: 'The user has access to module sale' },
},{ _id: false })

const rolesSchema = new Schema({
    name: { type: String, required: true, unique: true },
    permissions : {
        type : permissionsSchema ,
        default : {
            rol : defPrivileges,
            user : defPrivileges,
            access : defPrivileges,
            shopping : defPrivileges,
            supplier : defPrivileges,
            category : defPrivileges,
            product : defPrivileges,
            client : defPrivileges,
            productOrder : defPrivileges,
            sale : defPrivileges,
        },
    },
    state: { type: Boolean, required: true, default: true }
})

export default model('Role', rolesSchema)