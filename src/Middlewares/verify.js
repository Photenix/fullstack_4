import { getRolAllInfo } from '../Tools/rol.tool';

const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.API

const verify = ( req, res, next ) => {
    // Verifica el token y si es válido, pasa el control al siguiente middleware
    // En caso contrario, devuelve un error 401 (Unauthorized)
    //...
    // Implementación de la verificación del token
    let token = null
    token = req.header["x-access-token"]||req.headers["authorization"] || req.cookies.token
    
    // const token = req.cookies.token;
    
    if (!token) return res.status(401).json({ message: 'No hay token' });
    
    jwt.verify(token, SECRET_KEY, async (err, decoded) => {
        if (err) return res.status(401).json({ message: 'Token inválido' });
        req.user = decoded;
        next();
    })
}


const hasPermission = async (req, res, next) => {
    let method = req.method

    switch (method) {
        case "GET": method = "read"; break;
        case "POST": method = "create"; break;
        case "PUT": method = "update"; break;
        case "DELETE": method = "delete"; break;
        default: break;
    }

    try{
        let instance = req.originalUrl
        instance = instance.slice("/api/auth/".length)
        instance = instance.split("/")[0]
    
        if( instance === "profile" ) return next()
    
        const rol = await getRolAllInfo( req.user.rol )    
        const { permissions } = rol
    
        if( permissions[instance][method] ) return next()
        
        return res.status(403).json({ message: 'No tienes permisos para realizar esta acción' });
    }
    catch( err ){
        return res.status(400).json({ message: 'Error al validar permisos', error: err });
    }
}



export { verify, hasPermission }