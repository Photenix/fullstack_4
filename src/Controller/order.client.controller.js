import { v2 as cloudinary } from 'cloudinary';
import Venta from '../Models/ventaModel';


cloudinary.config({ 
    cloud_name: 'photenix', 
    api_key: '192637173257687', 
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const sendReceipt = async (req, res) => {
  try {
    // Verificar que el modelo existe
    const { id } = req.params;
    const { data } = req.body;

    if (!id) return res.status(400).json({ err: 'ID de venta requerido', success: false });

    if (!data) return res.status(400).json({ err: 'Imagen requerida', success: false });

    // console.log("Subiendo imagen a Cloudinary...");
    const uploadResponse = await cloudinary.uploader.upload(data, {
      upload_preset: 'ml_default',
      folder: 'Boutique/Receipts'
    });

    // console.log("Respuesta de Cloudinary:", uploadResponse);

    if (!uploadResponse.url) {
      console.log("Error: Cloudinary no devolvió URL");
      return res.status(400).json({ err: 'No se pudo subir la imagen', success: false });
    }

    console.log("Actualizando venta en base de datos...");
    const venta = await Venta.findByIdAndUpdate(
      id, 
      { receiptImage: uploadResponse.url },
      { new: true }
    );

    if (!venta) return res.status(404).json({ err: 'Venta no encontrada', success: false });

    return res.status(200).json({ 
      msg: 'Se subió la factura del recibo', 
      img: uploadResponse.url, 
      success: true 
    });
  }
  catch (err) {
    // console.error("Error en sendReceipt:", err);
    return res.status(500).json({ err: 'No se pudo subir la imagen', success: false });
  }
}

const getReceipt = async (req, res) => {
  try {
    // console.log("=== INICIO getReceipt ===");
    // console.log("ID recibido:", req.params.id);
    
    // Verificar que el modelo existe
    if (!Venta) {
      console.log("Error: Modelo Venta no encontrado");
      return res.status(500).json({ err: 'Error interno del servidor', success: false });
    }
    
    const { id } = req.params;

    if (!id) {
      console.log("Error: No se proporcionó ID");
      return res.status(400).json({ err: 'ID de venta requerido', success: false });
    }

    // console.log("Buscando venta en base de datos...");
    const venta = await Venta.findById(id);

    if (!venta) {
      console.log("Error: Venta no encontrada");
      return res.status(404).json({ err: 'Venta no encontrada', success: false });
    }

    // 🔍 AGREGAR ESTE DEBUG PARA VER QUÉ CONTIENE LA VENTA
    // console.log("=== ESTRUCTURA COMPLETA DE LA VENTA ===");
    // console.log("Venta encontrada:", JSON.stringify(venta, null, 2));
    // console.log("Campos disponibles:", Object.keys(venta.toObject ? venta.toObject() : venta));
    // console.log("receiptImage:", venta.receiptImage);
    // console.log("receipt:", venta.receipt);
    // console.log("comprobante:", venta.comprobante);
    // console.log("imagen:", venta.imagen);
    // console.log("=== FIN DEBUG ===");

    // Verificar si tiene comprobante (revisar diferentes nombres posibles)
    const posiblesCampos = [
      venta.receiptImage,
      venta.receipt,
      venta.comprobante,
      venta.imagen,
      venta.receiptUrl,
      venta.comprobanteImagen
    ];

    const comprobanteEncontrado = posiblesCampos.find(campo => campo && campo.trim() !== '');

    if (comprobanteEncontrado) {
      // console.log("✅ Comprobante encontrado:", comprobanteEncontrado);
      return res.status(200).json({ 
        receiptImage: comprobanteEncontrado,
        message: 'Comprobante encontrado',
        success: true 
      });
    } else {
      // console.log("❌ No hay comprobante para esta venta");
      // console.log("Valores verificados:", posiblesCampos);
      return res.status(200).json({ 
        receiptImage: null,
        message: 'No hay comprobante para este pedido',
        success: false 
      });
    }
  }
  catch (err) {
    console.error("Error en getReceipt:", err);
    return res.status(500).json({ err: 'Error al obtener comprobante', success: false });
  }
}



export { sendReceipt,  getReceipt };