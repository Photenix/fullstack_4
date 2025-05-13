// backend/src/Controller/supplier.controller.js
import Purchase from "../Models/compra.js";
import Supplier from "../Models/Suppliers.js";

const getSuppliers = async (req, res) => {
    try {
        const limit = req.query.limit || 10
        const page = req.query.page || 1
        const offset = (page - 1)  * limit
        // const suppliers = await Supplier.find();
        const suppliers = await Supplier.find().skip(offset).limit(limit);
        res.json({ data: suppliers, success: true });
    } catch (error) {
        res.status(500).json({ message: error.message, success: false });
    }
};

const getSupplierById = async (req, res) => {
    try {
        const supplier = await Supplier.findById(req.params.id);
        if (!supplier) return res.status(404).json({ message: 'Supplier not found', success: false });
        res.json(supplier);
    } catch (error) {
        res.status(500).json({ message: error.message, success: false });
    }
};

const getSupplierQuantity = async (req, res) => {
    try {
        const count = await Supplier.countDocuments({})
        return res.status(200).json({ quantity: count, success: true });
    } catch (error) {
        console.log( error );
        res.status(500).json({ message: error.message, success: false });
    }
}

const findSupplier = async (req, res) => {
    // find supplier by nit, company, phone and email
    try {
        const { find } = req.body;
        const suppliers = await Supplier.find({
            $or: [
                { nit: { $regex: `${find}.*`, $options: 'i' } },
                { companyName: { $regex: `${find}.*`, $options: 'i' } },
                { email: { $regex: `${find}.*`, $options: 'i' } },
                { phone: { $regex: `${find}.*`, $options: 'i' } },
            ]
        }).lean();
        // const suppliers = await Supplier.find({ name: new RegExp(name, 'i') });
        res.json({ data: suppliers, success: true });
    } catch (error) {
        res.status(500).json({ message: error.message, success: false });
    }
}

const createSupplier = async (req, res) => {
    try {
        const supplier = new Supplier(req.body);
        // console.log( supplier );
        await supplier.save();
        return res.status(201).json({ data: supplier, success: true });
    } catch (error) {
        console.log( error );
        
        return res.status(400).json({ message: error.message, success: false });
    }
};

const stateSupplier = async (req, res) => {
    try {
        const { state } = req.body;
        const update = await Supplier.findByIdAndUpdate(req.params.id, { $set: { state: state } }, { new: true });
        if (!update) return res.status(404).json({ message: 'Supplier not found', success: false });
        res.json({ data: update, success: true });
    } catch (error) {
        res.status(400).json({ message: error.message, success: false });
    }
}

const updateSupplier = async (req, res) => {
    try {
        const { nit } = req.body;
        if( nit ){
            delete req.body?.nit
        }

        const supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!supplier) return res.status(404).json({ message: 'Supplier not found' });
        return res.json(supplier);
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

const deleteSupplier = async (req, res) => {
    try {
        // find supplier by id and if is relation with a purchase don't delete
        const purchase = await Purchase.findOne({ supplierId: req.params.id });
        if (purchase) {
            return res.status(400).json({ message: 'Cannot delete supplier with related purchases', success: false });
        }
        const supplier = await Supplier.findByIdAndDelete(req.params.id);
        if (!supplier) {
            return res.status(404).json({ message: 'Supplier not found', success: false });
        }
        return res.status(200).json({ message: 'El proveedor ha sido eliminado', success: true })
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export { getSuppliers, getSupplierById, findSupplier, getSupplierQuantity,
    createSupplier, stateSupplier, updateSupplier, deleteSupplier };
