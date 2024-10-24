import Roles from "../Models/Roles";

const rolAdmin =  async () => {
    const rolAdmin = await Roles.findOne({ name: 'Admin' });
    if (!rolAdmin) {
        try{
            const privileges = {
                read: true,
                create: true,
                update: true,
                delete: true,
                download: true
            }
            const permissions = {
                rol: privileges,
                user : privileges,
                access : privileges,
                shopping : privileges,
                supplier : privileges,
                category: privileges,
                product : privileges,
                client : privileges,
                productOrder : privileges,
                sale : privileges,
            }
            // Create a new admin role with all permissions
            const rol = await Roles.create({ name: 'Admin' , permissions: permissions }); 
            rol.save()
            console.log("Successfully created admin");
        }
        catch(error){ console.error('Error al crear rol Admin', error); }
    }
}

const rolWorker =  async () => {
    const rolAdmin = await Roles.findOne({ name: 'Worker' });
    if (!rolAdmin) {
        try{
            const privileges = {
                read: true,
                create: true,
                update: false,
                delete: false,
                download: false
            }
            const permissions = {
                rol: { read:false, create:false, update:false, delete:false, download: false },
                user : privileges,
                access : { read:true, create:true, update:true, delete:true, download: false },
                shopping : privileges,
                supplier : privileges,
                category : privileges,
                product : privileges,
                client : { read:true, create:true, update:true, delete:false, download: false },
                productOrder : privileges,
                sale : privileges,
            }
            // Create a new admin role with all permissions
            const rol = await Roles.create({ name: 'Worker' , permissions: permissions }); 
            rol.save()
            console.log("Successfully created admin");
        }
        catch(error){ console.error('Error al crear rol Admin', error); }
    }
}

const rolClient = async() => {
    const rolClient = await Roles.findOne({ name: 'Client' });
    if (!rolClient) {
        try{
            const privileges = {
                read: false,
                create: false,
                update: false,
                delete: false,
                download: false
            }
            const permissions = {
                rol: privileges,
                user : privileges,
                access : { read:true, create:true, update:true, delete:true, download: true },
                shopping : privileges,
                supplier : privileges,
                category : privileges,
                product : privileges,
                client : privileges,
                productOrder : { read:true, create:true, update:false, delete:false, download:true},
                sale : privileges,
            }
            // Create a new admin role with all permissions
            const rol = await Roles.create({ name: 'Client' , permissions: permissions }); 
            rol.save()
            console.log("Successfully created admin");
        }
        catch(error){ console.error('Error al crear rol Admin', error); }
    }
}

const getRol = async ( name ) => {
    console.log( name );
    
    const rolAdmin = await Roles.findOne({ name: name });
    return rolAdmin._id;
}

export { rolAdmin, rolWorker, rolClient, getRol}