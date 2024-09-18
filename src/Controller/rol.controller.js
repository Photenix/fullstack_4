import Roles from "../Models/Roles";

const getRoles = async ( req, res ) => {
    const roles = await Roles.find();
    return res.status(200).json(roles);
}

const getPermissions = async ( req, res ) => {
    const { name } = req.params
    try{
        // const permissions = await Roles.findOne({name}).populate('permissions');
        const permissions = await Roles.findOne({name},"permissions");
        return res.status(200).json(permissions);
    }
    catch(e){
        return res.status(404).json({message: 'Error al obtener los permisos', error: e.message});
    }
}

const updatePermissions = async (req, res) => {
    const { id, permissions, name } = req.body
    try{
        if( name === "Admin" ) return res.status(400).json({message:'No se puede actualizar usuario Admin'})
        const role = await Roles.findByIdAndUpdate(id, { permissions });
        return res.status(200).json(role);
    }
    catch(e){
        return res.status(404).json({message: 'Error al actualizar los permisos', error: e.message});
    }
}

export { getRoles, getPermissions, updatePermissions }