import Venta from "../Models/ventaModel";

const getSellsByUser = async (req, res) => {
    const { user } = req
    if (!user) return res.status(401).json({ message: 'No hay usuario logueado', success: false });
    
    // const realUser = await Users.findById(user._id).lean()
    //coger ID y buscar el sell
    const realUser = await Venta.find({cliente: user._id}).lean()
    console.log( user._id );
    
    console.log( realUser);
    

    if (!realUser) return res.status(404).json({ message: 'No se encontró el usuario', success: false });
    return res.status(200).json(realUser);
}

export { getSellsByUser }