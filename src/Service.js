const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const { engine } = require('express-handlebars')
const mainRoutes = require('./Router/index.routes')
const authRoutes = require('./Router/auth.routes')

const path = require('path');

class Service {
    constructor( dir ) {
        console.log("Init service")
        this.app = express()
        this.settersApp()
        // this.viewEngine()
        this.app.use(express.static( path.join( dir, "static" )))
        this.routes()
    }

    start() {
        const PORT = process.env.PORT || 3030
        const HOST = process.env.HOST || '0.0.0.0'
        this.app.listen( PORT, HOST, () => {
            console.log(`Service Box Nova started on port ${PORT}`)
            console.log(`open in http://localhost:${PORT}`)
            
            // Obtener la dirección IP de la máquina en la red local
            const os = require('os');
            const interfaces = os.networkInterfaces();
            for (const inf in interfaces) {
                for (const details of interfaces[inf]) {
                    // Filtrar las direcciones IPv4
                    if (details.family === 'IPv4' && !details.internal) {
                        console.log(`Accede al servidor desde: http://${details.address}:${PORT}`);
                    }
                }
            }
        })
    }

    viewEngine() {
        this.app.engine( 'handlebars', engine({
            runtimeOptions: {
                allowProtoPropertiesByDefault: true,
                allowProtoMethodsByDefault: true
            }
        }) )
        this.app.set( 'view engine', 'handlebars' );
        this.app.set( 'views', './src/Views' )
    }

    settersApp() {
        // config cors, cookies and API key
        console.log( "Iniciando use");
        this.app.use( cors({
            origin: ['http://localhost:5173', '*', '0.0.0.0', "http://localhost:5174"],
            credentials: true
        }) )
        // this.app.use( cors() )
        this.app.use( cookieParser() )
        this.app.use( bodyParser.json({limit: '5mb'}) )
        this.app.use(bodyParser.urlencoded({ limit: '5mb', extended: true }));
        this.app.use( express.json() )
        this.app.use( express.urlencoded({ extended: true }) )
        this.app.set('key', process.env.API)
    }

    routes() {
        this.app.use("/api", mainRoutes)
        this.app.use("/api/auth", authRoutes)
    }

}

module.exports = Service