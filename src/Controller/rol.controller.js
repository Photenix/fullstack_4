import Roles from "../Models/Roles";
import Users from "../Models/Users";

const getRoles = async ( req, res ) => {
    try{
        const roles = await Roles.find();
        return res.status(200).json( {data: roles, success: true} );
    }
    catch(e){
        return res.status(404).json({message: 'Error al obtener los roles', error: e.message, success: false});
    }
}

//get specific role
const getRole = async ( req, res ) => {
    const { id } = req.params
    try{
        const role = await Roles.findById(id);
        if (!role) {
            return res.status(404).json({ message: 'Rol no encontrado', success: false});
        }
        res.status(200).json({ data: role, success: true });
    }
    catch(e){
        return res.status(404).json({message: 'Error al obtener el rol', error: e.message, success: false});
    }
}

const getPermissions = async ( req, res ) => {
    const { name } = req.params
    try{
        // const permissions = await Roles.findOne({name}).populate('permissions');
        const permissions = await Roles.findOne({name: new RegExp(name,'i')},"permissions");
        return res.status(200).json(permissions);
    }
    catch(e){
        return res.status(404).json({message: 'Error al obtener los permisos', error: e.message});
    }
}

const createRol = async ( req, res ) => {
    const { name, permissions } = req.body
    try{
        if( !name || !permissions ) return res.status(400).json({message:"NO se pudo crear rol", success: false})
        const role = new Roles({ name, permissions });
        await role.save();
        return res.status(200).json({ message: 'Rol creado correctamente', data: role, success: true });
    }
    catch(e){
        return res.status(404).json({ message: 'Error al crear el rol', error: e.message, success: false });
    }
}

const updatePermissions = async (req, res) => {
    try{
        const { id } = req.params
        const { permissions, name } = req.body
        if( name === "Admin" ) return res.status(400).json({message:'No se puede actualizar usuario Admin', success: false })
        const role = await Roles.findByIdAndUpdate(id, { permissions });
        return res.status(200).json({ data: role, success: true });
    }
    catch(e){
        return res.status(404).json({message: 'Error al actualizar los permisos', error: e.message});
    }
}

const updateRol = async (req, res) => {
    const { id, state } = req.body
    try{
        const role = await Roles.findById( id ).lean()
        if( role.name === "Admin" ) return res.status(400).json({message:'No se puede actualizar usuario Admin', success: false })
        const upRole = await Roles.findByIdAndUpdate(id, { state });
        return res.status(200).json({ message: 'Se ha cambiado el estado del rol', data: upRole, success: true });
    }
    catch(e){
        return res.status(404).json({message: 'Error al eliminar el rol', error: e.message, success: false});
    }
}

const deleteRol = async (req, res) => {
    const { id } = req.params
    try{
        //find role
        const frole = await Roles.findById( id ).lean()
        if(!frole) return res.status(404).json({message:'Rol no encontrado', success: false })
            // the user can delete the role that are by default
        if( frole.name === "Admin" || frole.name === "Worker" || frole.name === "Client") {
            return res.status(400).json({message:'No se puede eliminar este rol', success: false })
        }

        const anyUser = await Users.findOne({ rol: id });

        if( anyUser ) return res.status(400).json({message:'No se puede eliminar el rol, tiene usuarios asociados', success: false })
        
        const role = await Roles.findByIdAndDelete(id);
        return res.status(200).json({ message: 'Rol eliminado correctamente', success: true });
    }
    catch(e){
        return res.status(404).json({message: 'Error al eliminar el rol', error: e.message, success: false});
    }
}

export { getRoles, getRole, getPermissions, createRol, updatePermissions, updateRol, deleteRol }