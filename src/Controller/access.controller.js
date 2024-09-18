import Users from '../Models/Users';
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const SECRET_KEY = process.env.API


const getToken = async (req, res) => {
    
    const { email, password } = req.body
    
    if (!email ||!password) return res.status(400).json({ message: 'Debes enviar correo y password' });
    
    const user = await Users.findOne({ email }).lean()
    
    if (!user) return res.status(404).json({ message: 'No se encontró el usuario' });

    const hash = await bcrypt.compare(password, user.password)
    
    if( !hash ) return res.status(401).json({ message: 'Contraseña incorrecta' });

    delete user.password

    // const token = jwt.sign(user, SECRET_KEY, { expiresIn:'1h'})    
    const token = jwt.sign(user, SECRET_KEY, { expiresIn:'7d'})

    res.cookie('token', token,{
        httpOnly : true,
        secure : false,
        maxAge : 1000 * 60 * 60 * 24 * 6.5
        // 1000 ms 60 seconds 60 minutes and 24 hours and 6.5 days
    })
    
    res.json({ message: 'Login exitoso' });
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


export { getToken, confirmToken, getProfile };