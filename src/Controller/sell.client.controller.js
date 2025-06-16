// backend\src\Controller\sell.client.controlller.js
const Sell = require('../models/sell.model'); // Asegúrate de que la ruta al modelo sea correcta

const getSellsByUser = async (req, res) => {
  const { user } = req;

  if (!user || !user._id) {
    return res.status(401).json({ message: "No hay un usuario logueado o la información del usuario es inválida", success: false });
  }

  try {
    const userId = user._id; // Suponiendo que el ID del usuario está en req.user._id
    const sells = await Sell.find({ userId: userId }).populate('cliente'); // Busca las ventas con el userId y opcionalmente popula la información del cliente
    return res.status(200).json({ sells, success: true });
  } catch (error) {
    console.error("Error al obtener las ventas del usuario:", error);
    return res.status(500).json({ message: "Error al obtener las ventas", success: false });
  }
};

export { getSellUser, getSellsByUser }; // Exporta la nueva función