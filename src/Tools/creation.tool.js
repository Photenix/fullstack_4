/**
 * @param { array } values => this is a array that the function is verify that the field contains the values
 * @param { object } field => this is the field to validate
 * @returns { [boolean, String, object] } return true if the field contains all values
 */
const validateInformationField = ( values = [], field = {}) => {
    let obj = {}
    for (let i = 0; i < values.length; i++) {
        const element = values[i];
        const check = field[element]
        if( check === undefined ) return [ false, `error info ${element} is undefined`, {} ]
        obj[ element ] = check
    }
    return [ true, '', obj ] // return true if all values are valid
}

export default validateInformationField