require('dotenv').config()
require('./src/conn');

const Service = require('./src/Service')

const service = new Service( __dirname )

service.start()