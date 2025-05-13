// Controllers/ventaController.js (actualizado)
const Venta = require('../Models/ventaModel');
const DetalleVenta = require('../Models/detalleVentaModel');
const Descuento = require('../Models/descuentoModel');

// Crear una nueva Venta
const crearVenta = async (req, res) => {
  try {
    const { cliente, productos, estado, fecha, direccion, ciudad, total, totalDescuento } = req.body;

    // Valido que todos los campos requeridos estén presentes
    if (!cliente || !productos || !direccion || !ciudad || !total) {
      return res.status(400).json({ success: false, message: 'Todos los campos son requeridos' });
    }

    // Creo la venta con todos los datos
    const nuevaVenta = new Venta({
      cliente,
      estado: estado || 'Pendiente',
      fecha: fecha || Date.now(),
      direccion,
      ciudad,
      total,
      totalDescuento: totalDescuento || 0,
      productos: productos.map(producto => ({
        productoId: producto.productoId,
        nombre: producto.nombre,
        cantidad: producto.cantidad,
        precio: producto.precio,
        descuento: producto.descuento || 0,
        descuentoAplicado: producto.descuentoAplicado || 0,
        precioFinal: producto.precioFinal || producto.precio,
        descuentoPreconfiguradoId: producto.descuentoPreconfiguradoId || null
      }))
    });

    await nuevaVenta.save();

    // Guardar los productos en detalleVenta
    const detalles = productos.map(producto => ({
      ventaId: nuevaVenta._id,
      productoId: producto.productoId,
      nombreProducto: producto.nombre,
      cantidad: producto.cantidad,
      precio: producto.precio,
      descuento: producto.descuento || 0,
      descuentoAplicado: producto.descuentoAplicado || 0,
      precioFinal: producto.precioFinal || producto.precio,
      descuentoPreconfiguradoId: producto.descuentoPreconfiguradoId || null
    }));

    await DetalleVenta.insertMany(detalles);

    res.status(201).json({ success: true, message: 'Venta creada exitosamente', venta: nuevaVenta, detalles });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al crear la venta', error });
  }
};

// Obtengo todas las Ventas
const obtenerVentas = async (req, res) => {
  try {
    const ventas = await Venta.find().populate('cliente');
    res.status(200).json(ventas);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Obtener una venta por ID
const obtenerVentaPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const venta = await Venta.findById(id).populate('cliente');
    
    if (!venta) {
      return res.status(404).json({ success: false, message: 'Venta no encontrada' });
    }
    
    res.status(200).json(venta);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener la venta', error });
  }
};

// Actualizar estado de una venta
const actualizarEstadoVenta = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    
    if (!estado) {
      return res.status(400).json({ success: false, message: 'El estado es requerido' });
    }
    
    const venta = await Venta.findByIdAndUpdate(
      id, 
      { estado }, 
      { new: true, runValidators: true }
    );
    
    if (!venta) {
      return res.status(404).json({ success: false, message: 'Venta no encontrada' });
    }
    
    res.status(200).json({ success: true, message: 'Estado de venta actualizado', venta });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al actualizar el estado de la venta', error });
  }
};

// Eliminar una venta
const eliminarVenta = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Eliminar la venta
    const venta = await Venta.findByIdAndDelete(id);
    
    if (!venta) {
      return res.status(404).json({ success: false, message: 'Venta no encontrada' });
    }
    
    // Eliminar los detalles asociados
    await DetalleVenta.deleteMany({ ventaId: id });
    
    res.status(200).json({ success: true, message: 'Venta eliminada exitosamente' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al eliminar la venta', error });
  }
};

module.exports = {
  crearVenta,
  obtenerVentas,
  obtenerVentaPorId,
  actualizarEstadoVenta,
  eliminarVenta
};