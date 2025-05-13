import Suppliers from "../Models/Suppliers";
import validateInformationField from "../Tools/creation.tool";

const INFO_SUPPLIER = [
  "nit", "companyName", "contact", "city",
  "country", "address", "phone", "email",
];

//verify and check if the information of Supplier is valid
const checkSupplierCreation = async (req, res, next) => {
  try{
    const body = req.body;
  
    const [isOk, message, json] = validateInformationField(INFO_SUPPLIER, body);
    if (!isOk) return res.status(400).json({ message, success: false });
  
    const user = await Suppliers.findOne({
      $or: [{ nit: body["nit"] }],
    });
  
    if (user === null) {
      req.body = json;
      next();
    }
    else{
      // data is a array that say whats fields of format will to be mark like invalid
      return res.status(400).json({
        message: `El dato nit debe de ser unico`,
        data: ["nit"],
        success: false,
      });
    }
  }
  catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error en el proceso", success: false });
  }
};


export { checkSupplierCreation }