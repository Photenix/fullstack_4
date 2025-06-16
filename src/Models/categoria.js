const mongoose = require('mongoose');

const subcategoriaSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    activo: { type: Boolean, default: true } // Añadir campo activo con valor predeterminado true
});

const categoriaSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    activo: { type: Boolean, default: true }, // Añadir campo activo con valor predeterminado true
    subCategorias: [subcategoriaSchema]
});

categoriaSchema.methods.addSubcategoria = async function (subCategoria) {
  // Asegurarse de que la subcategoría tenga el campo activo
  if (subCategoria.activo === undefined) {
    subCategoria.activo = true;
  }
  this.subCategorias.push(subCategoria);
  await this.save();
  return this;
};

// Método para actualizar subcategoría
categoriaSchema.methods.updateSubcategoria = async function (subId, subCategoriaActualizada) {
  const subCategoriaIndex = this.subCategorias.findIndex(sub => sub._id.toString() === subId);
  if (subCategoriaIndex === -1) throw new Error('Subcategoría no encontrada');
  
  // Actualizar nombre y mantener el estado activo si no se proporciona
  this.subCategorias[subCategoriaIndex].nombre = subCategoriaActualizada.nombre;
  if (subCategoriaActualizada.activo !== undefined) {
    this.subCategorias[subCategoriaIndex].activo = subCategoriaActualizada.activo;
  }
  
  await this.save();
  return this;
};

// Método para eliminar subcategoría
categoriaSchema.methods.deleteSubcategoria = async function (subId) {
  this.subCategorias = this.subCategorias.filter(sub => sub._id.toString() !== subId);
  await this.save();
  return this;
};

module.exports = mongoose.model('Categoria', categoriaSchema);