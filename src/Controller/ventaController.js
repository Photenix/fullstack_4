const Venta = require('../Models/ventaModel');

// Crear una nueva Venta (Create)
const crearVenta = async (req, res) => {
  try {
    const venta = new Venta(req.body);
    await venta.save();
    res.status(201).json(venta);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Obtener todas las Ventas (Read All)
const obtenerVentas = async (req, res) => {
  try {
    const ventas = await Venta.find();
    res.status(200).json(ventas);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


module.exports = {
  crearVenta,
  obtenerVentas,
  
};
