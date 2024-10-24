const Categoria = require('../Models/categoria'); // Importar el modelo de Categoria

// Obtener todas las categorías
const getCategorias = async (req, res) => {
  try {
    const categorias = await Categoria.find();
    res.status(200).json(categorias);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener las categorías', error });
  }
};

// Obtener una categoría por ID
const getCategoriaById = async (req, res) => {
  try {
    const categoria = await Categoria.findById(req.params.id);
    if (!categoria) {
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }
    res.status(200).json(categoria);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener la categoría', error });
  }
};

// Crear una nueva categoría
const createCategoria = async (req, res) => {
  const { nombre, subCategorias } = req.body;
  try {
    const nuevaCategoria = new Categoria({
      nombre,
      subCategorias,
    });
    await nuevaCategoria.save();
    res.status(201).json(nuevaCategoria);
  } catch (error) {
    res.status(400).json({ message: 'Error al crear la categoría', error });
  }
};

// Actualizar una categoría
const updateCategoria = async (req, res) => {
  try {
    const categoriaActualizada = await Categoria.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!categoriaActualizada) {
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }
    res.status(200).json(categoriaActualizada);
  } catch (error) {
    res.status(400).json({ message: 'Error al actualizar la categoría', error });
  }
};

// Eliminar una categoría
const deleteCategoria = async (req, res) => {
  try {
    const categoriaEliminada = await Categoria.findByIdAndDelete(req.params.id);
    if (!categoriaEliminada) {
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }
    res.status(200).json({ message: 'Categoría eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar la categoría', error });
  }
};

// Añadir subcategoría
const addSubcategoria = async (req, res) => {
  try {
    const categoria = await Categoria.findById(req.params.id);
    if (!categoria) {
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }

    const { nombre } = req.body; // Asegúrate de que estás desestructurando 'nombre' correctamente
    if (!nombre) {
      return res.status(400).json({ message: 'El nombre de la subcategoría es requerido' });
    }

    const nuevaSubcategoria = { nombre };
    await categoria.addSubcategoria(nuevaSubcategoria); // Agregar subcategoría
    res.status(200).json(categoria); // Retorna la categoría actualizada
  } catch (error) {
    res.status(500).json({ message: 'Error al añadir la subcategoría', error });
  }
};
// Actualizar subcategoría
// Actualizar subcategoría
const updateSubcategoria = async (req, res) => {
  try {
      const categoria = await Categoria.findById(req.params.id);
      if (!categoria) {
          return res.status(404).json({ message: 'Categoría no encontrada' });
      }
      const { subId } = req.params;
      const { nombre } = req.body; // Cambiado aquí

      const subCategoriaIndex = categoria.subCategorias.findIndex(sub => sub._id.toString() === subId);
      if (subCategoriaIndex === -1) {
          return res.status(404).json({ message: 'Subcategoría no encontrada' });
      }

      // Actualiza el nombre de la subcategoría
      categoria.subCategorias[subCategoriaIndex].nombre = nombre; // Cambiado aquí
      await categoria.save();
      res.status(200).json(categoria);
  } catch (error) {
      res.status(500).json({ message: 'Error al actualizar la subcategoría', error });
  }
};


// Eliminar subcategoría
const deleteSubcategoria = async (req, res) => {
  try {
    const categoria = await Categoria.findById(req.params.id);
    if (!categoria) {
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }
    const { subId } = req.params;
    categoria.subCategorias = categoria.subCategorias.filter(sub => sub._id != subId);
    await categoria.save();
    res.status(200).json(categoria);
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar la subcategoría', error });
  }
};



export { getCategorias, getCategoriaById, createCategoria, updateCategoria, deleteCategoria, addSubcategoria, updateSubcategoria, deleteSubcategoria };
