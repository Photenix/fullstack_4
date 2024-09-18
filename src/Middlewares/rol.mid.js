import Roles from "../Models/Roles";

const INFO_PERMISSIONS = [
    "user", "rol", "access", "shopping", "supplier",
    "product", "client", "productOrder", "sale"
]

const INFO_PRIVILEGES = [ "read", "create", "delete", "update", "download" ]

const checkPermissions = async ( req, res, next ) => {
    try{
        const { id, permissions } = req.body
        const rol = await Roles.findById(id).lean();

        for (let i = 0; i < INFO_PERMISSIONS.length; i++) {
            const permission = INFO_PERMISSIONS[i];

            if( permissions[permission] ){

                for (let j = 0; j < INFO_PRIVILEGES.length; j++) {
                    const priv = INFO_PRIVILEGES[j];
                    //change permission
                    const status = permissions[permission][priv]
                    if( status != undefined ){
                        rol.permissions[permission][priv] = status;
                    }
                }

            }
            
        }

        // send permission and name to update role
        req.body.permissions = rol.permissions
        req.body.name = rol.name
        
        next()
    }
    catch( err ){
        return res.status(400).json({ message: 'Error al validar permisos' });
    }
}


export { checkPermissions };