import Cliente from '../Models/cliente.js';

export const clientFindAll = async (req, res) => {
    try {
        const clients = await Cliente.find();
        res.json(clients);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los clientes', error });
    }
}

export const clientFindById = async (req, res) => {
    try {
        const client = await Cliente.findById(req.params.id);
        if (!client) {
            return res.status(404).json({message: 'Cliente no encontrado'});
        }
        res.json(client);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el cliente', error });
    }
}

export const clientCreate = async (req, res) => {    
    try {
        const client = new Cliente(req.body);
        await client.save();
        res.status(201).json({ message: 'Cliente creado con éxito', client });
    } catch (error) {
        res.status(400).json({ message: 'Error al crear el cliente', error });
    }
}

export const clientViewUpdate = async (req, res) => {
    try {
        const client = await Cliente.findById(req.params.id);
        if (!client) {
            return res.status(404).json({message: 'Cliente no encontrado'});
        }
        let date = client.birthdate.toISOString().split('T')[0];
        res.render('update', { client, date });
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el cliente para actualizar', error });
    }
}

export const clientUpdate = async (req, res) => {
    try {
        const client = await Cliente.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!client) {
            return res.status(404).json({message: 'Cliente no encontrado'});
        }
        res.status(200).json({ message: 'Cliente actualizado correctamente', client });
    } catch (error) {
        res.status(400).json({ message: 'Error al actualizar el cliente', error });
    }
}

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
