// backend/src/Controller/supplier.controller.js
import Supplier from "../Models/Proveedor.js";

const getSuppliers = async (req, res) => {
    try {
        const suppliers = await Supplier.find();
        res.json(suppliers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getSupplierById = async (req, res) => {
    try {
        const supplier = await Supplier.findById(req.params.id);
        if (!supplier) return res.status(404).json({ message: 'Supplier not found' });
        res.json(supplier);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createSupplier = async (req, res) => {
    const supplier = new Supplier(req.body);
    try {
        const newSupplier = await supplier.save();
        res.status(201).json(newSupplier);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const updateSupplier = async (req, res) => {
    try {
        const updatedSupplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedSupplier) return res.status(404).json({ message: 'Supplier not found' });
        res.json(updatedSupplier);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deleteSupplier = async (req, res) => {
    try {
        const supplier = await Supplier.findByIdAndDelete(req.params.id);
        if (!supplier) return res.status(404).json({ message: 'Supplier not found' });
        res.json({ message: 'Supplier deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export { getSuppliers, getSupplierById, createSupplier, updateSupplier, deleteSupplier };
