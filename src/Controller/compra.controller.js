import Purchase from "../Models/compra.js";
import Product from "../Models/Products.js"; // Asegúrate de importar el modelo de Product

const getPurchases = async (req, res) => {
    try {
        const purchases = await Purchase.find().populate('supplierId').populate('products.productId');
        res.json(purchases);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getPurchaseById = async (req, res) => {
    try {
        const purchase = await Purchase.findById(req.params.id).populate('supplierId').populate('products.productId');
        if (!purchase) return res.status(404).json({ message: 'compra no encontrada' });
        res.json(purchase);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const cancelPurchase = async (req, res) => {
    try {
        // Buscar la compra por ID
        const purchase = await Purchase.findById(req.params.id);
        if (!purchase) return res.status(404).json({ message: 'Compra no encontrada', success: false });
        
        // Verificar si ya está cancelada
        if (purchase.status === 'Canceled') {
            return res.status(400).json({ message: 'La compra ya está cancelada', success: false });
        }

        // Restaurar stock
        for (const item of purchase.products) {
            await Product.findByIdAndUpdate(
                item.productId,
                { $inc: { totalQuantity: item.quantity } }
            );
        }

        // Actualizar solo el estado usando findByIdAndUpdate en lugar de save()
        // Esto evita la validación completa del documento
        const updatedPurchase = await Purchase.findByIdAndUpdate(
            req.params.id,
            { status: 'Canceled' },
            { new: true, runValidators: false }
        );

        res.json({ message: 'Compra cancelada exitosamente', success: true });
    } catch (error) {
        res.status(500).json({ message: error.message, success: false });
    }
};
// Controlador para crear compra
const createPurchase = async (req, res) => {
    const { supplierId, products, invoiceNumber } = req.body;

    try {
        // Validar número de factura
        if (!invoiceNumber) {
            return res.status(400).json({ 
                message: 'El número de factura es obligatorio', 
                success: false 
            });
        }

        // Verificar número de factura único
        const existingPurchase = await Purchase.findOne({ invoiceNumber });
        if (existingPurchase) {
            return res.status(400).json({
                message: 'El número de factura ya está en uso',
                success: false
            });
        }

        // Calcular total
        const total = products.reduce((acc, item) => acc + (item.quantity * item.price), 0);

        // Crear compra - aseguramos que el status sea 'Active'
        const purchase = new Purchase({
            invoiceNumber,
            supplierId,
            products: products.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
                price: item.price
            })),
            total,
            status: 'Active' // Aseguramos que sea 'Active'
        });

        // Guardar y actualizar stock
        await purchase.save();
        for (const item of products) {
            await Product.findByIdAndUpdate(
                item.productId,
                { $inc: { totalQuantity: -item.quantity } }
            );
        }

        res.status(201).json({ data: purchase, success: true });
    } catch (error) {
        res.status(400).json({ message: error.message, success: false });
    }
};

const updatePurchase = async (req, res) => {
    try {
        const updatedPurchase = await Purchase.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedPurchase) return res.status(404).json({ message: 'compra no encontrada' });
        res.json(updatedPurchase);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deletePurchase = async (req, res) => {
    try {
        const purchase = await Purchase.findByIdAndDelete(req.params.id);
        if (!purchase) return res.status(404).json({ message: 'compra no encontrada' });
        res.json({ message: 'La compra ha sido eliminada correctamente' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export { getPurchases, getPurchaseById, createPurchase, updatePurchase, deletePurchase };