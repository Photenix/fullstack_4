import Users from "../Models/Users"
import validateInformationField from "../Tools/creation.tool"

const INFO_USER = [
  "typeIdentifier", "documentNumber", "username",
  "password", "email", "firstName", "lastName",
  "phone", "birthdate", "address", "rol"
]

const INFO_CLIENT = [
  "typeIdentifier", "documentNumber", "username",
  "password", "email", "firstName", "lastName",
  "phone", "birthdate", "address"
]

//verify and clean date information (check all)
const checkUserPA = async ( req, res, next ) =>{
  const body = req.body

  const user = await Users.findOne({ email:body["email"] })
  if( user !== null ) return res.status(400).json({message: 'El correo ya se encuentra registrado'})

  const [ isOk, message, json ] = validateInformationField( INFO_USER, body )
  if( !isOk ) return res.status(400).json({message, success: false})
  req.body = json
  next()
}

// check if is a propiertie valit (one)
const checkUserUpdate = ( req, res, next ) =>{
  const body = req.body.changes
  let obj = {}

  if( req.body.id === undefined ) return res.status(404).json({message:'user ID not found'})

  if( body === undefined ) return res.status(400).json({message: "not exist changes"})
  
  for (let i = 0; i < INFO_USER.length; i++){
    const element = INFO_USER[i];
    if( body[element] != undefined ) obj[element] = body[element]
  }

  if( Object.entries(obj).length === 0 ) return res.status(400).json({message: "not exist changes"})
  req.body.changes = obj
  next()
}


const makeClient = async ( req, res, next ) =>{
  const body = req.body

  const user = await Users.findOne({ email:body["email"] })
  if( user !== null ) return res.status(400).json({message: 'El correo ya se encuentra registrado'})

  const [ isOk, message, json ] = validateInformationField( INFO_CLIENT, body )
  if( !isOk ) return res.status(400).json({message, success: false})
  json.rol = "Worker"
  req.body = json
  next()
}


export { checkUserPA, checkUserUpdate, makeClient }