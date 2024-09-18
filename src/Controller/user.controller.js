import Users from '../Models/Users';
import { getRolAll, getRolName } from '../Tools/rol.tool'

const getUsers = async (req, res) => {
    const roles = await getRolAll()
    const users = await Users.find().lean()

    for (let i = 0; i < users.length; i++) {
        const user = users[i]
        user.password = "*****"; // Evitar que se muestre la contraseña en la respuesta JSON
        let rol = roles.find( e => user.rol.equals(e._id) )
        user.rol = rol.name
    }
    return res.json(users);
}

const getUserById = async (req, res) => {    
    const user = await Users.findById(req.params.id).lean()
    if(!user) return res.status(404).json({ message: 'No se encontró el usuario' });
    const rol = await getRolName( user.rol )
    user.password = "*****";
    user.rol = rol
    return res.json(user);
}

const createUser = async (req, res) => {
    try{
        const user = new Users( req.body );
        await user.save();
        return res.json({ message: 'Usuario creado exitosamente' });
    }
    catch(e){
        res.status(404).json({message:'Error al crear el usuario', error: e.message});
    }
}

const updateUser = async ( req, res ) => {
    const { id, changes } = req.body;
    try{
        const user = await Users.findByIdAndUpdate(id, changes)
        res.status(200).json({ message: 'Usuario editado', info: user })
    }
    catch(e){
        res.status(404).json({message:'Error al actualizar el usuario', error: e.message});
    }
}

const deleteUser = async (req, res) => {
    try{
        const { id } = req.body;

        const user = await Users.findByIdAndDelete(id)
        
        if(!user) return res.status(404).json({ message: 'No se encontró el usuario' });
        res.status(200).json({message: "Usuario eliminado"})
    }
    catch(e){
        res.status(404).json({message:'Error al eliminar el usuario', error: e.message});
    }
}



export { getUsers, getUserById, createUser, updateUser, deleteUser } 