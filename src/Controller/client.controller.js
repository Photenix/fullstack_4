import mongoose from 'mongoose';
import Cliente from '../Models/cliente.js';
import { getRolAll, getRolID } from '../Tools/rol.tool.js';
import Users from '../Models/Users.js';

// Obtener todos los clientes
export const clientFindAll = async (req, res) => {
    try {
        const clients = await Cliente.find();
        res.json(clients);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los clientes', error });
    }
};

//Return the number of client
export const getClientQuantity = async (req, res) => {
    try{
        const roleClient = await getRolID("Client")
        const count = await Users.countDocuments({ rol: roleClient })
        return res.json({ quantity: count });
    }
    catch(e){
        res.status(404).json({message:'Error al obtener la cantidad de usuarios', error: e.message, success: false});
    }
}

export const getClient = async (req, res) => {
    try{
        const limit = req.query.limit || 10
        const page = req.query.page || 1
        const offset = (page - 1)  * limit
        
        const roles = await getRolAll()
        const roleClient = await getRolID("Client")
        const users = await Users.find({ rol: roleClient }).skip(offset).limit(limit).lean()
    
        for (let i = 0; i < users.length; i++) {
            const user = users[i]
            user.password = "*****"; // Evitar que se muestre la contraseña en la respuesta JSON
            let rol = roles.find( e => user.rol.equals(e._id) )
            user.rol = rol.name
        }

        return res.json(users);
    }
    catch(e){
        return res.status(500).json({ message: 'Error: '+e, success: false })
    }
}


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




// Crear un nuevo cliente (simulado)
export const clientCreate = async (req, res) => {
    const { nombreCompleto, direccion, ciudad, telefono, email, documentoIdentidad, pais } = req.body;

    // Verificar si existe un campo 'id' y eliminarlo si está presente
    if (req.body.id) {
        delete req.body.id;
    }

    try {
        // Verificar si ya existe un cliente con el mismo email o número de documento
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

        // Crear el cliente
        const client = new Cliente({
            nombreCompleto,
            direccion,
            ciudad,
            telefono,
            email,
            documentoIdentidad,
            pais
        });

        // Guardar el cliente en la base de datos
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
