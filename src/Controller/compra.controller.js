// backend/src/Controller/purchase.controller.js
import Purchase from "../Models/compra.js";

const getPurchases = async (req, res) => {
    try {
        const purchases = await Purchase.find().populate('supplier');
        res.json(purchases);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getPurchaseById = async (req, res) => {
    try {
        const purchase = await Purchase.findById(req.params.id).populate('supplier');
        if (!purchase) return res.status(404).json({ message: 'Purchase not found' });
        res.json(purchase);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createPurchase = async (req, res) => {
    const { supplier, product, quantity, price } = req.body;
    const total = quantity * price;
    try {
        const purchase = new Purchase({ supplier, product, quantity, price, total });
        const newPurchase = await purchase.save();
        res.status(201).json({ data: newPurchase, success: true });
    } catch (error) {
        res.status(400).json({ message: error.message, success: false });
    }
};

const updatePurchase = async (req, res) => {
    try {
        const updatedPurchase = await Purchase.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedPurchase) return res.status(404).json({ message: 'Purchase not found' });
        res.json(updatedPurchase);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deletePurchase = async (req, res) => {
    try {
        const purchase = await Purchase.findByIdAndDelete(req.params.id);
        if (!purchase) return res.status(404).json({ message: 'Purchase not found' });
        res.json({ message: 'Purchase deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export { getPurchases, getPurchaseById, createPurchase, updatePurchase, deletePurchase };
