import jwt from 'jsonwebtoken';
import { getRolAllInfo } from '../Tools/rol.tool.js';

const SECRET_KEY = process.env.API;

const verify = (req, res, next) => {
    const token = req.headers["x-access-token"] || req.headers["authorization"] || req.cookies?.token;

    if (!token) {
        return res.status(401).json({ message: 'No hay token', success: false });
    }

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            res.clearCookie("token")
            if( err.name === 'TokenExpiredError' ) {
                return res.status(401).json({ message: 'Token expirado', success: false });
            }
            return res.status(403).json({ message: 'Token inválido', success: false });
        }
        req.user = decoded;
        next();
    });
};

const hasPermission = async (req, res, next) => {
    let method = req.method;

    switch (method) {
        case "GET": method = "read"; break;
        case "POST": method = "create"; break;
        case "PUT": method = "update"; break;
        case "DELETE": method = "delete"; break;
    }

    try {
        let instance = req.originalUrl;
        instance = instance.slice("/api/auth/".length).split("/")[0].split("?")[0];

        if (instance === "profile") return next();

        const rol = await getRolAllInfo(req.user.rol);
        const { permissions } = rol;

        if (instance === "purchase") instance = "shopping";
        if( instance === "ventas" ) instance = "sale";

        if (permissions?.[instance]?.[method]) return next();

        return res.status(403).json({ message: 'No tienes permisos para realizar esta acción', success: false });
    } catch (err) {
        console.error(err);
        return res.status(400).json({ message: 'Error al validar permisos', error: err });
    }
};

export { verify, hasPermission };
