import Roles from "../Models/Roles";

const getRolID = async ( name ) => {
    const rolName = await Roles.findOne({ name: name });
    return rolName._id;
}

const getRolName = async ( id ) => {
    const rol = await Roles.findById(id);
    return rol.name;
}

const getRolAllInfo = async ( id ) => {
    const rol = await Roles.findById(id);
    return rol;
}

const getRolAll = async () => {
    const roles = await Roles.find({},'name _id');
    return roles;
}


export { getRolID, getRolName, getRolAllInfo, getRolAll }