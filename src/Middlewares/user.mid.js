import Users from "../Models/Users"
import validateInformationField from "../Tools/creation.tool"
import { getRolID } from "../Tools/rol.tool"

const INFO_USER = [
  "typeIdentifier", "documentNumber", "username",
  "password", "email", "firstName", "lastName",
  "phone", "birthdate", "address", "rol", "city", "country", "state"
]

const INFO_CLIENT = [
  "typeIdentifier", "documentNumber", "username",
  "password", "email", "firstName", "lastName",
  "phone", "birthdate", "address", "city", "country"
]

//verify and clean date information (check all)
const checkUserPA = async ( req, res, next ) =>{
  const body = req.body

  const [ isOk, message, json ] = validateInformationField( INFO_USER, body )
  if( !isOk ) return res.status(400).json({message, success: false})

  // const user = await Users.findOne({ email:body["email"] })
  const user = await Users.findOne({
      $or: [
        { email: body["email"] },
        { documentNumber: body["documentNumber"] },
        { phone: body["phone"] }
      ]
  });

  if( user === null ){
    req.body = json
    return next()
  }
  
  //get all fields that are not unique
  let notUniqueFile = []
  let notUniqueFileShow = []

  //? think more latter put this code in other file to re-use to other modules
  let dataUnique = [ "email", "documentNumber", "phone" ]
  // traduction to spanish
  let dataUniqueShow = [ "correo", "numero de documento", "teléfono" ]
  
  //verify and clean date information
  dataUnique.forEach( (e, i) => {
    if( user[e] === body[e] ) {
      notUniqueFile.push( e )
      notUniqueFileShow.push( dataUniqueShow[i] )
    }
  })
  //data is a array that say whats fields of format will to be mark like invalid
  return res.status(400).json({
    message: `Los siguientes valores no son únicos: ${notUniqueFileShow.join(', ')}`,
    data: notUniqueFile,
    success: false}
  )
  
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
  try{
    const body = req.body
  
    const user = await Users.findOne({ email:body["email"] })
    if( user !== null ) return res.status(400).json({message: 'El correo ya se encuentra registrado'})
    
    const [ isOk, message, json ] = validateInformationField( INFO_CLIENT, body )
    if( !isOk ) return res.status(400).json({message, success: false})
    json.rol = await getRolID( "Client" )
    json.state = true
    req.body = json
    next()
  }
  catch( error ){
    return res.status(400).json({ message: 'Error al crear usuario', error: error })
  }
}


export { checkUserPA, checkUserUpdate, makeClient }