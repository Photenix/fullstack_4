import Roles from "../Models/Roles";

const getRoles = async ( req, res ) => {
    const roles = await Roles.find();
    return res.status(200).json(roles);
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
        if( !name || !permissions ) return res.status(400).json({message:"NO se pudo crear rol"})
        const role = new Roles({ name, permissions });
        await role.save();
        return res.status(200).json({ message: 'Rol creado correctamente', data: role, success: true });
    }
    catch(e){
        return res.status(404).json({ message: 'Error al crear el rol', error: e.message, success: false });
    }
}

const updatePermissions = async (req, res) => {
    const { id, permissions, name } = req.body
    try{
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
        return res.status(404).json({message: 'Error al eliminar el rol', error: e.message});
    }
}

const deleteRol = async (req, res) => {
    const { id } = req.params
    try{
        const frole = await Roles.findById( id ).lean()
        if( frole.name === "Admin" || frole.name === "Worker" ) return res.status(400).json({message:'No se puede eliminar este rol', success: false })
        const role = await Roles.findByIdAndDelete(id);
        if(!role) return res.status(404).json({message:'Rol no encontrado', success: false })
        return res.status(200).json({ message: 'Rol eliminado correctamente', success: true });
    }
    catch(e){
        return res.status(404).json({message: 'Error al eliminar el rol', error: e.message, success: false});
    }
}

export { getRoles, getPermissions, createRol, updatePermissions, updateRol, deleteRol }