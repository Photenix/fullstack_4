import Users from '../Models/Users';
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const SECRET_KEY = process.env.API


const getToken = async (req, res) => {
    
    const { email, password } = req.body
    
    if (!email ||!password) return res.status(400).json({ message: 'Debes enviar correo y password', success: false });
    
    const user = await Users.findOne({ email }).lean()
    
    if (!user) return res.status(404).json({ message: 'No se encontró el usuario',success: false });

    const hash = await bcrypt.compare(password, user.password)
    
    if( !hash ) return res.status(401).json({ message: 'Contraseña incorrecta', success: false });

    delete user.password

    // const token = jwt.sign(user, SECRET_KEY, { expiresIn:'1h'})    
    const token = jwt.sign(user, SECRET_KEY, { expiresIn:'7d'})

    res.cookie('token', token,{
        httpOnly : true,
        secure : false,
        sameSite: 'None',
        maxAge : 1000 * 60 * 60 * 24 * 6.5
        // 1000 ms 60 seconds 60 minutes and 24 hours and 6.5 days
    })
    
    res.json({ message: 'Login exitoso', success: true});
}

const confirmToken = async (req, res) => {
    const token = req.cookies.token;

    if (!token) return res.status(401).json({ message: 'No hay token' });
    
    // Decodificamos el token para obtener el payload (datos del usuario)
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Token inválido' });
        }
        res.json({ message: 'Acceso permitido', user: decoded });
    });
}


const getProfile = async (req, res) => {
    const { user } = req
    if (!user) return res.status(401).json({ message: 'No hay usuario logueado' });
    return res.json(user);
}

const getPIN = async (req, res) => {
    const { email } = req.body
    try{
        const user = await Users.findOne({ email }).lean()
        if (!user) return res.status(404).json({ message: 'No se encontró el usuario', success: false });
        res.json({ data:{ message: 'El código de confirmación ha sido enviado a su correo', id: user._id }, success: true })
    }
    catch(e){
        return res.status(404).json({ message: 'Error: '+e, success: false })
    }
}

const newPassword = async (req, res) => {
    const { id } = req.params
    const { password } = req.body
    try{
        // console.log( id, password );
        const user = Users.findByIdAndUpdate(id, { password })
        return res.status(200).json({ message: 'Contraseña cambiada', success: true })
    }
    catch(e){
        return res.status(404).json({ message: 'Error: '+e, success: false })
    }
}

const deleteAcount = async (req, res) => {
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


export { getToken, confirmToken, getProfile, getPIN, newPassword, deleteAcount };