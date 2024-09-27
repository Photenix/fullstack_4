const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser');
const { engine } = require('express-handlebars')
const mainRoutes = require('./Router/index.routes')
const authRoutes = require('./Router/auth.routes')

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
        this.app.listen( PORT, () => {
            console.log(`Service Box Nova started on port ${PORT}`)
            console.log(`open in http://localhost:${PORT}`)
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
            origin: 'http://localhost:5173',
            credentials: true
        }) )
        // this.app.use( cors() )
        this.app.use( cookieParser() )
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