import Users from '../Models/Users';
import { getRolAll, getRolID, getRolName } from '../Tools/rol.tool'

const getUsers = async (req, res) => {
    try{
        const limit = req.query.limit || 10
        const page = req.query.page || 1
        const offset = (page - 1)  * limit
        
        const roles = await getRolAll()
        const users = await Users.find().skip(offset).limit(limit).lean()
    
        for (let i = 0; i < users.length; i++) {
            const user = users[i]
            user.password = "*****"; // Evitar que se muestre la contraseña en la respuesta JSON
            let rol = roles.find( e => user.rol.equals(e._id) )
            user.rol = rol.name
        }
        return res.json(users);
    }
    catch(e){
        return res.status(404).json({ message: 'Error: '+e, success: false })
    }
}

const findUser = async (req, res) => {
    const { find } = req.body 

    // for (const inf of Object.keys(info)) {
    //     info[ inf ] = { $regex: `${info[inf]}.*`, $options: 'i' }
    // }
    
    const users = await Users.find({
        $or: [
            { lastName: { $regex: `${find}.*`, $options: 'i' } },
            { firstName: { $regex: `${find}.*`, $options: 'i' } },
            { email: { $regex: `${find}.*`, $options: 'i' } },
            { phone: { $regex: `${find}.*`, $options: 'i' } },
            { documentNumber: { $regex: `${find}.*`, $options: 'i' } }
        ]
    }).lean();

    if( users.length === 0 ) return res.status(404).json({ message: 'No se encontraron usuarios que tenga esa información' });

    const roles = await getRolAll()
    for (let i = 0; i < users.length; i++) {
        const user = users[i]
        user.password = "*****"; // Evitar que se muestre la contraseña en la respuesta JSON
        let rol = roles.find( e => user.rol.equals(e._id) )
        user.rol = rol.name
    }
    return res.json(users);
}

//Return the number of users
const getUserQuantity = async (req, res) => {
    try{
        const count = await Users.countDocuments({})
        return res.json({ quantity: count });
    }
    catch(e){
        res.status(404).json({message:'Error al obtener la cantidad de usuarios', error: e.message, success: false});
    }
}

const getUserById = async (req, res) => {    
    try {
        const user = await Users.findById(req.params.id).lean()
        if(!user) return res.status(404).json({ message: 'No se encontró el usuario' });
        // const rol = await getRolName( user.rol )
        user.password = "*****";
        // user.rol = rol
        return res.json(user);
    } catch (error) {
        return res.status(404).json({ message: 'Error: ' + error })
    }
}

const createUser = async (req, res) => {

    const bestText = {
        email: 'Correo electrónico',
        phone: 'Telefono',
        documentNumber: 'Numero de documento',
    }

    try{
        // Find the rol by name and return a id
        // const idRol = await getRolID( req.body.rol )
        // req.body.rol = idRol
        console.log( req.body );
        
        const user = new Users( req.body );
        await user.save();
        return res.json({ message: 'Usuario creado exitosamente', success: true });
    }
    catch(e){
        console.log( e );
        
        if( e.code === 11000 ){
            const notValidField = Object.keys(e.keyValue)[0]
            return res.status(409).json({ message: `El valor del campo ${bestText[notValidField]} ya está en uso`, data:[ notValidField ], success: false });
        }
        return res.status(404).json({message:'Error al crear el usuario', error: e.message, success: false});
    }
}

const updateUser = async ( req, res ) => {
    const { id, changes } = req.body;
    try{
        /*
        if( changes.rol !== undefined ){
            const idRol = await getRolID( changes.rol )
            changes.rol = idRol
        }
        */

        const user = await Users.findByIdAndUpdate(id, changes)
        return res.status(200).json({ message: 'Usuario editado', info: user, success: true })
    }
    catch(e){
        res.status(404).json({message:'Error al actualizar el usuario', error: e.message, success: false});
    }
}

const deleteUser = async (req, res) => {
    try{
        const { id } = req.params;
        const user = await Users.findById(id)
        const rol = await getRolName( user.rol)
        if( rol === "Admin" ){
            return res.status(403).json({ message: 'No se puede eliminar un usuario con rol Admin', success: false });
        }
        else{
            const user = await Users.findByIdAndDelete(id)
            if(!user) return res.status(404).json({ message: 'No se encontró el usuario', success: false });
            res.status(200).json({message: "Usuario eliminado", success: true})
        }
    }
    catch(e){
        res.status(404).json({message:'Error al eliminar el usuario', error: e.message, success: false});
    }
}



export { getUsers, findUser, getUserQuantity, getUserById, createUser, updateUser, deleteUser } 
