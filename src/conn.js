import { connect } from "mongoose";

const URL = (process.env.MONGO + process.env.DB) || ('mongodb://localhost:27017/'+'BoxNovaSoft')

const connectDB = async () => {
    try {
        await connect(URL);
        console.log('Conectado a MongoDB');
    } catch (error) {
        console.error('No se pudo conectar a MongoDB', error);
    }
};


export default connectDB();