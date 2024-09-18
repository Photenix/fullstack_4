import Client from "../Models/Clients.js";

const clientFindAll = async (req, res) => {
    const client = await Client.find()
    res.json(client)
    // res.render('clients', {client})
}

const clientFindById = async (req, res) => {
    const client = await Client.findById(req.params.id)
    // res.send(client)
    if( client !== undefined || client != null ) {
        return res.json(client)
    }
    res.status(404).json({message: 'Not Found'})
}

const clientCreate = async (req, res) => {    
    try{
        const client = new Client(req.body)
        await client.save()
        res.send('Cliente creado con exito')
    }
    catch(e){
        res.send('Error cliente no creado')
    }
}

const clientViewUpdate = async (req, res) => {
    const client = await Client.findById(req.params.id)
    let date = client.birthdate.toISOString().split('T')[0];
    date = date.split('T')[0]
    
    res.render('update', { client, date })
}

const clientUpdate = async (req, res) => {
    try{
        const client = await Client.findByIdAndUpdate(req.params.id, req.body, { new: true })
        res.redirect('/client');
    }
    catch(e){
        res.send('Error al actualizar el cliente')
    }
}

const clientDelete = async (req, res) => {
    await Client.findByIdAndDelete(req.params.id)
    res.send("Cliente eliminado correctamente")
}


export { clientFindAll, clientFindById, clientCreate, clientUpdate, clientDelete, clientViewUpdate } 