import Transporter from '../mailer';
import Pin from '../Models/Pin';
import Users from '../Models/Users';
import { getRolAllInfo, getRolName } from '../Tools/rol.tool';

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const SECRET_KEY = process.env.API

const textEmail = ( name, pin ) => {
    // Cuerpo del correo en formato HTML
    return `
    <!DOCTYPE html>
    <html lang="es">
        <head>
            <style>
                .pin {
                    font-size: 24px;
                    font-weight: bold;
                    color: #4CAF50;
                    cursor: pointer; /* Cambia el cursor para indicar que es interactivo */
                    user-select: all; /* Permite seleccionar el texto */
                }
                .pin-container {
                    /*
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    */
                    text-align: center;
                    background-color: #f2f2f2;
                    padding: 20px;
                    width: 300px;
                }
            </style>
        </head>
        <body>
            <h1>¡Hola ${name}!</h1>
            <div class="pin-container">
                <p>Tu PIN es</p>
                <br>
                <span class="pin" id="pin">${pin}</span>
            </div>
            <footer>
                <p>Este es un mensaje automático, por favor no respondas.</p>
            </footer>
        </body>
    </html>
    `;
}


const getToken = async (req, res) => {
    
    const { email, password } = req.body
    
    if (!email ||!password) return res.status(400).json({ message: 'Debes enviar correo y password', success: false });
    try{
        // Buscamos el usuario en la base de datos por el correo
        const user = await Users.findOne({ email }).lean()
        if (!user) return res.status(404).json({ message: 'No se encontró el usuario',success: false });

        const hash = await bcrypt.compare(password, user.password)

        if( !hash ) return res.status(401).json({ message: 'Contraseña o correo incorrecto', success: false });

        if( !user.state ) return res.status(401).json({ message: 'El usuario se encuentra deshabilitado', success: false });
        //verify if the role of user is active
        const rolUser = await getRolAllInfo(user.rol)
        if( !rolUser.state ) return res.status(401).json({ message: 'El rol del usuario se encuentra deshabilitado', success: false });

        // console.log( rolUser );
        let listPermissions = []
        const keys = Object.keys(rolUser.permissions)

        //get list of the view permitions access to next show on the front
        for (let i = 0; i < keys.length; i++) {
            const permission = keys[i];
            const key = rolUser.permissions[permission]
            if( key.read || key.update || key.create || key.delete || key.download ) listPermissions.push(permission)
            else continue
        }
        // console.log( listPermissions );

        delete user.password
        
        // const token = jwt.sign(user, SECRET_KEY, { expiresIn:'1m'})
        const token = jwt.sign(user, SECRET_KEY, { expiresIn:'7d'})

        res.cookie('token', token,{
            httpOnly : true,
            secure : false,
            maxAge : 1000 * 60 * 60 * 24 * 6.5
            // 1000 ms 60 seconds 60 minutes and 24 hours and 6.5 days
        })

        res.json({ data: { rol: rolUser.name, username: user.username, email: user.email, permissions: listPermissions }, message: 'Login exitoso', success: true});
    }
    catch(error){
        console.log(error)
        return res.status(500).json({ message: 'Error al buscar el usuario', success: false });
    }
}

const confirmToken = async (req, res) => {
    try{
        const token = req.cookies.token;
        if (!token) return res.status(401).json({ message: 'No hay token', isAuthenticated:false });
        
        // Decodificamos el token para obtener el payload (datos del usuario)
        jwt.verify(token, SECRET_KEY, (err, decoded) => {
            if (err) {
                res.clearCookie("token")
                if( err.name === 'TokenExpiredError' ) {
                    return res.status(401).json({ message: 'Token expirado', success: false });
                }
                return res.status(403).json({ message: 'Token inválido', success: false });
            }
            res.json({ message: 'Acceso permitido', user: decoded, isAuthenticated: true });
        });
    }
    catch(e){
        return res.status(500).json({ message: 'Error en el servidor', success: false });
    }
}

const getProfile = async (req, res) => {
    const { user } = req
    if (!user) return res.status(401).json({ message: 'No hay usuario logueado' });
    try {
        // Modifica esta línea para incluir el _id en la consulta
        const realUser = await Users.findById(user._id).lean();
        if (!realUser) return res.status(404).json({ message: 'No se encontró el usuario', success: false });
        return res.json(realUser);
    } catch (error) {
        console.error('Error al obtener el perfil:', error);
        return res.status(500).json({ message: 'Error al obtener el perfil', success: false });
    }
}

function generatePIN() {
    const pin = Math.floor(100000 + Math.random() * 900000).toString().slice(0, 5); // Genera un pin de 6 dígitos
    return pin;
}

const getPIN = async (req, res) => {
    try{
        const { email } = req.body
        const user = await Users.findOne({ email }).lean()

        if (!user) return res.status(404).json({ message: 'No se encontró el usuario', success: false });

        // delete the last PIN of the user
        const pinDB = await Pin.findOne({ userId: user._id }).lean()
        if( pinDB ) {
            await Pin.findByIdAndDelete(pinDB._id)
        }

        const newPin = new Pin({ userId: user._id, email, pin: generatePIN() });
        await newPin.save();


        
        const mailOptions = {
            from: 'Boutique',
            to: user.email,
            subject: "Pin de restablecimiento de contraseña Boutique",
            html: textEmail(user.username, newPin.pin),
        };

        await Transporter.sendMail(mailOptions);
        
        // console.log( newPin);

        res.json({
            data:{ 
                message: 'El código de confirmación ha sido enviado a su correo', 
                id: user._id
            },
            success: true 
        })
    }
    catch(e){
        console.log( e );
        
        return res.status(500).json({ message: 'Error: '+e, success: false })
    }
}

const resendPIN = async (req, res) => {
    try{
        const { id } = req.params;
        const user = await Users.findById(id).lean()
        if(!user) return res.status(404).json({ message: 'No se encontró el usuario', success: false });
        // delete the last PIN of the user
        const pinDB = await Pin.findOne({ userId: id }).lean()
        if( pinDB ) {
            await Pin.findByIdAndDelete(pinDB._id)
        }
        //create new pin
        const newPin = new Pin({ userId: user._id, email: user.email, pin: generatePIN() });
        await newPin.save();

        const mailOptions = {
            from: 'Boutique',
            to: user.email,
            subject: "Pin de restablecimiento de contraseña Boutique",
            html: textEmail(user.username, newPin.pin),
        };

        await Transporter.sendMail(mailOptions);
        // console.log( newPin );
        res.json({
            data:{ 
                message: 'El código de confirmación ha sido enviado a su correo', 
                id: user._id
            },
            success: true 
        })
    }
    catch(e){
        console.log(e);
        
        return res.status(500).json({ message: 'Error: '+e, success: false })
    }
}

const confirmPIN = async (req, res) => {
    try{
        const { id } = req.params;
        const { pin } = req.body
        const pinDB = await Pin.findOne({ userId: id }).lean()
        if( !pinDB ) return res.status(404).json({ message: 'No se encontró el PIN', success: false });
        if( pinDB.pin !== pin ) return res.status(400).json({ message: 'El PIN es incorrecto', success: false });

        const changePassword = jwt.sign( { id }, SECRET_KEY, { expiresIn:'1m'})
        //the PIN is allow of one use then delete
        await Pin.findByIdAndDelete(pinDB._id)
        res.status(200).json({ message: 'PIN confirmado', data:{ token: changePassword }, success: true })
    }
    catch(e){
        res.status(500).json({ message: 'Error: '+e, success: false })
    }
}


const newPassword = async (req, res) => {
    try{
        // const { id } = req.params
        const { token, password } = req.body

        // Decodificamos el token para obtener el payload (datos del usuario)
        jwt.verify(token, SECRET_KEY, (err, decoded) => {
            if (err) {
                return res.status(401).json({ message: 'Cambio de contraseña fallido por expiración de tiempo', isAuthenticated:false });
            }
            // console.log( decoded._id );
            // console.log( decoded );
            const user = Users.findByIdAndUpdate( decoded.userId, { password })
            if( !user ) return res.status(404).json({ message: 'No se encontró el usuario, no se cambio contraseña', success: false });
            return res.status(200).json({ message: 'Contraseña cambiada', success: true })
            // return res.status(200).json({ message: 'Contraseña cambiada', success: true })
        });
    }
    catch(e){
        return res.status(404).json({ message: "No se ha podido cambiar contraseña", success: false, error: 'Error: '+e})
    }
}

/**
 * Can edit account allow if the account token is the same of the count
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
const editAccount = async (req, res) => {
    try{
        const token = req.cookies.token;
        const { username, firstName, lastName, phone, address } = req.body;

        if (!token) return res.status(401).json({ message: 'No hay token', isAuthenticated:false });
        
        // Decodificamos el token para obtener el payload (datos del usuario)
        jwt.verify(token, SECRET_KEY, async (err, decoded) => {
            if (err) {
                return res.status(401).json({ message: 'Token inválido', isAuthenticated:false });
            }
            const user = await Users.findByIdAndUpdate( decoded._id, { username, firstName, lastName, phone, address }).lean()
            if( !user ) return res.status(404).json({ message: 'No se encontró el usuario', success: false });
            return res.json({ message: 'Se ha modificado con éxito la cuenta', success: true, data: user });
        });
    }
    catch(e){
        console.log(e);
        
        return res.status(500).json({ message: 'Error en el servidor', success: false });
    }
}

const deleteAccount = async (req, res) => {
    try{
        const { id } = req.body;
        const user = await Users.findByIdAndDelete(id)
        if(!user) return res.status(404).json({ message: 'No se encontró el usuario' });
        res.clearCookie("token")
        res.status(200).json({message: "Usuario eliminado", success: true})
    }
    catch(e){
        res.status(404).json({message:'Error al eliminar el usuario', error: e.message, success: false});
    }
}

const logout = async (req, res) => {
    try{
        res.clearCookie("token")
        res.status(200).json({ message: 'Sesión cerrada', success: true });
    }
    catch(e){
        res.status(404).json({ message: 'Error al cerrar la sesión', success: false });
    }
}

export { getToken, confirmToken, getProfile, editAccount, getPIN, resendPIN, confirmPIN, newPassword, deleteAccount, logout };