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
  const { nombre, subCategorias, activo } = req.body;
  try {
    const nuevaCategoria = new Categoria({
      nombre,
      subCategorias: subCategorias || [],
      activo: activo !== undefined ? activo : true // Valor predeterminado: true
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

    const { nombre, activo } = req.body;
    if (!nombre) {
      return res.status(400).json({ message: 'El nombre de la subcategoría es requerido' });
    }

    const nuevaSubcategoria = { 
      nombre, 
      activo: activo !== undefined ? activo : true // Valor predeterminado: true
    };
    await categoria.addSubcategoria(nuevaSubcategoria); // Agregar subcategoría
    res.status(200).json(categoria); // Retorna la categoría actualizada
  } catch (error) {
    res.status(500).json({ message: 'Error al añadir la subcategoría', error });
  }
};

// Actualizar subcategoría
const updateSubcategoria = async (req, res) => {
  try {
    const categoria = await Categoria.findById(req.params.id);
    if (!categoria) {
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }
    const { subId } = req.params;
    const { nombre, activo } = req.body;

    const subCategoriaIndex = categoria.subCategorias.findIndex(sub => sub._id.toString() === subId);
    if (subCategoriaIndex === -1) {
      return res.status(404).json({ message: 'Subcategoría no encontrada' });
    }

    // Actualiza el nombre y estado de la subcategoría
    if (nombre !== undefined) {
      categoria.subCategorias[subCategoriaIndex].nombre = nombre;
    }
    if (activo !== undefined) {
      categoria.subCategorias[subCategoriaIndex].activo = activo;
    }
    
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

// Cambiar estado de una categoría
const toggleCategoryState = async (req, res) => {
  try {
    const { id } = req.params;
    const { activo } = req.body;
    
    if (activo === undefined) {
      return res.status(400).json({ message: 'El estado activo es requerido' });
    }
    
    const categoria = await Categoria.findById(id);
    if (!categoria) {
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }
    
    categoria.activo = activo;
    
    // Si estamos desactivando la categoría, también desactivamos todas las subcategorías
    if (activo === false && Array.isArray(categoria.subCategorias)) {
      categoria.subCategorias.forEach(sub => {
        sub.activo = false;
      });
    }
    
    await categoria.save();
    res.status(200).json(categoria);
  } catch (error) {
    res.status(500).json({ message: 'Error al cambiar el estado de la categoría', error });
  }
};

// Cambiar estado de una subcategoría
const toggleSubcategoryState = async (req, res) => {
  try {
    const { id, subId } = req.params;
    const { activo } = req.body;
    
    if (activo === undefined) {
      return res.status(400).json({ message: 'El estado activo es requerido' });
    }
    
    const categoria = await Categoria.findById(id);
    if (!categoria) {
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }
    
    const subCategoriaIndex = categoria.subCategorias.findIndex(sub => sub._id.toString() === subId);
    if (subCategoriaIndex === -1) {
      return res.status(404).json({ message: 'Subcategoría no encontrada' });
    }
    
    // Si estamos activando una subcategoría, aseguramos que la categoría esté activa
    if (activo === true && categoria.activo === false) {
      categoria.activo = true;
    }
    
    categoria.subCategorias[subCategoriaIndex].activo = activo;
    await categoria.save();
    res.status(200).json(categoria);
  } catch (error) {
    res.status(500).json({ message: 'Error al cambiar el estado de la subcategoría', error });
  }
};

export { 
  getCategorias, 
  getCategoriaById, 
  createCategoria, 
  updateCategoria, 
  deleteCategoria, 
  addSubcategoria, 
  updateSubcategoria, 
  deleteSubcategoria,
  toggleCategoryState,
  toggleSubcategoryState
};