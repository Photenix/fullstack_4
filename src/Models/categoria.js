const mongoose = require('mongoose');

const subcategoriaSchema = new mongoose.Schema({
    nombre: { type: String, required: true }
});

const categoriaSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    subCategorias: [subcategoriaSchema]
});


categoriaSchema.methods.addSubcategoria = async function (subCategoria) {
  this.subCategorias.push(subCategoria); // Asegúrate de que 'subCategoria' tenga el formato correcto
  await this.save();
  return this;
};
// Método para actualizar subcategoría
categoriaSchema.methods.updateSubcategoria = async function (subId, subCategoriaActualizada) {
  const subCategoriaIndex = this.subCategorias.findIndex(sub => sub._id.toString() === subId);
  if (subCategoriaIndex === -1) throw new Error('Subcategoría no encontrada');
  
  this.subCategorias[subCategoriaIndex].nombre = subCategoriaActualizada.nombre;
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
