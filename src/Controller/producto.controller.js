import Producto from '../Models/producto';

const createProducto = async (req, res) => {
  try {
    const nuevoProducto = new Producto(req.body);
    await nuevoProducto.save();
    res.status(201).json(nuevoProducto);
  } catch (error) {
    res.status(400).json({ message: 'Error al crear el producto', error });
  }
};

const getProductos = async (req, res) => {
  try {
    const productos = await Producto.find();
    res.status(200).json(productos);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los productos', error });
  }
};

const getProductoById = async (req, res) => {
  try {
    const producto = await Producto.findOne({ idProd: req.params.id });
    if (!producto) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    res.status(200).json(producto);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el producto', error });
  }
};

const updateProducto = async (req, res) => {
  try {
    const productoActualizado = await Producto.findOneAndUpdate(
      { idProd: req.params.id },
      req.body,
      { new: true }
    );
    if (!productoActualizado) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    res.status(200).json(productoActualizado);
  } catch (error) {
    res.status(400).json({ message: 'Error al actualizar el producto', error });
  }
};

const deleteProducto = async (req, res) => {
  try {
    const productoEliminado = await Producto.findOneAndDelete({ idProd: req.params.id });
    if (!productoEliminado) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    res.status(200).json({ message: 'Producto eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el producto', error });
  }
};

<<<<<<<< HEAD:backend/src/Controller/controlador.producto.js
module.exports = {
  createProducto,
  getProductos,
  getProductoById,
  updateProducto,
  deleteProducto
};
========
export { createProducto, getProductos, getProductoById, updateProducto, deleteProducto };
>>>>>>>> main:backend/src/Controller/producto.controller.js
