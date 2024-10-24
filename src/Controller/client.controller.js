import mongoose from 'mongoose';
import Cliente from '../Models/cliente.js';

// Obtener todos los clientes
export const clientFindAll = async (req, res) => {
    try {
        const clients = await Cliente.find();
        res.json(clients);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los clientes', error });
    }
};

// Obtener cliente por ID
export const clientFindById = async (req, res) => {
    try {
        const client = await Cliente.findById(req.params.id);
        if (!client) {
            return res.status(404).json({ message: 'Cliente no encontrado' });
        }
        res.json(client);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el cliente', error });
    }
};

// Crear un nuevo cliente
export const clientCreate = async (req, res) => {
    const { nombreCompleto, direccion, ciudad, telefono, email, documentoIdentidad, pais } = req.body;
  
    try {
      const existingClient = await Cliente.findOne({
        $or: [
          { email: email },
          { 'documentoIdentidad.numero': documentoIdentidad.numero }
        ]
      });
  
      if (existingClient) {
        return res.status(400).json({ 
          message: 'Ya existe un cliente con ese email o número de documento', 
          success: false 
        });
      }
  
      const client = new Cliente({
        nombreCompleto,
        direccion,
        ciudad,
        telefono,
        email,
        documentoIdentidad,
        pais
      });
  
      await client.save();
      res.status(201).json({ message: 'Cliente creado con éxito', client, success: true });
    } catch (error) {
      console.error('Error al crear el cliente:', error);
      res.status(500).json({ message: 'Error al crear el cliente', error: error.message, success: false });
    }
  };
  
// Actualizar un cliente existente
export const clientUpdate = async (req, res) => {
    const { id } = req.params;
    const { nombreCompleto, direccion, ciudad, telefono, email, documentoIdentidad, pais } = req.body;

    // Validar si el ID es un ObjectId válido
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'ID no válido' });
    }

    // Validar tipo de documento de identidad (si se envía)
    if (documentoIdentidad && !['CC', 'DPI', 'Pasaporte', 'TI', 'CE', 'NIT'].includes(documentoIdentidad.tipo)) {
        return res.status(400).json({ message: 'Tipo de documento de identidad inválido' });
    }

    try {
        const client = await Cliente.findByIdAndUpdate(
            id,
            { nombreCompleto, direccion, ciudad, telefono, email, documentoIdentidad, pais },
            { new: true }
        );

        if (!client) {
            return res.status(404).json({ message: 'Cliente no encontrado' });
        }

        res.status(200).json({ message: 'Cliente actualizado correctamente', client });
    } catch (error) {
        res.status(400).json({ message: 'Error al actualizar el cliente', error });
    }
};

// Eliminar un cliente
export const clientDelete = async (req, res) => {
    try {
        const clienteEliminado = await Cliente.findByIdAndDelete(req.params.id);
        if (!clienteEliminado) {
            return res.status(404).json({ message: 'Cliente no encontrado' });
        }
        res.status(200).json({ message: 'Cliente eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar el cliente', error });
    }
};
