import Purchase from "../Models/compra";
import Devolucion from "../Models/devolucionModel";
import Products from "../Models/Products";
import Users from "../Models/Users";
import Venta from "../Models/ventaModel";
import { getRolID } from "../Tools/rol.tool";

const getQuantityClient = async () =>{
  try{
    const roleClient = await getRolID("Client")
    const count = await Users.countDocuments({ rol: roleClient })
    return count
  }
  catch(e){
    return 0
  }
}

const getQuantityProduct = async () => {
  try {
      const count = await Products.countDocuments({})
      return count
  } catch (error) {
      return 0
  }
}

const getQuantitySell = async ( init = new Date(), end = new Date() ) => {
  try {
    // const count = await Venta.countDocuments({})
    // return count
    const price =  await Venta.aggregate([
      {
        $match: {
          fecha: {
            $gte: init,
            $lt: end
          },
          estado: {$nin: ['cancelado', 'pendiente']}
          // estado: {$nin: ['cancelado']}
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$total" },
          count: { $sum: 1 }
        }
      }
    ])

    return price[0]
  } catch (error) {
    return { total: 0, count: 0 }
  }
};

const getQuantityPurchase = async ( init = new Date(), end = new Date() ) => {
  try {
    // const count = await Purchase.countDocuments({ status: 'Active' })
    // return count
    const price =  await Purchase.aggregate([
      {
        $match: {
          purchaseDate: {
            $gte: init,
            $lt: end
          },
          status: 'Active'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$total" },
          count: { $sum: 1 }
        }
      }
    ])
    
    return price[0]
  } catch (error) {
    return { total: 0, count: 0 }
  }
};

const getQuantityDevolution = async ( init = new Date(), end = new Date() ) => {
  try {
    // const count = await Devolucion.countDocuments({})
    // return count
    const price =  await Devolucion.aggregate([
      {
        $match: {
            fecha: {
            $gte: init,
            $lt: end
          }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalDevuelto" },
          count: { $sum: 1 }
        }
      }
    ])

    return price[0]
  }
  catch(e){
    return { total: 0, count: 0 }
  }
}

const getPurchasesByMonth = async ( year, month ) => {
  try {
    // Validar que el mes esté entre 1-12
    if (month < 1 || month > 12) {
      return res.status(400).json({ error: 'Mes inválido' });
    }

    // Crear fechas de inicio y fin del mes
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);
    
    const result = await Purchase.aggregate([
      {
        $match: {
          purchaseDate: {
            $gte: startDate,
            $lt: endDate
          },
          status: 'Active'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$total" },
          count: { $sum: 1 }
        }
      }
    ]);

    // Si no hay resultados, retornar 0
    const response = result.length > 0 
      ? { total: result[0].total, count: result[0].count } 
      : { total: 0, count: 0 };

    return response
  } catch (error) {
    return { total: 0, count: 0 }
  }
};

const getSellMonth = async (year, month) => {
  try {
    // Validación del mes
    if (month < 1 || month > 12) {
      return res.status(400).json({ 
        error: 'Mes inválido (debe ser entre 1-12)' 
      });
    }

    // Crear fechas de inicio y fin del mes
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);
    
    // Agregación para calcular métricas mensuales
    const result = await Venta.aggregate([
      {
        $match: {
          fecha: {
            $gte: startDate,
            $lt: endDate
          },
          // estado: { $nin: ['cancelado'] } // Excluir ventas canceladas
          estado: { $nin: ['cancelado', 'pendiente'] } // Excluir ventas canceladas
        }
      },
      {
        $group: {
          _id: null,
          totalVentas: { $sum: "$total" },
          totalDescuentos: { $sum: "$totalDescuento" },
          cantidadVentas: { $sum: 1 },
          // Puedes agregar más métricas si necesitas
          promedioVenta: { $avg: "$total" }
        }
      },
      {
        $project: {
          _id: 0, // Excluir el campo _id
          totalVentas: 1,
          totalDescuentos: 1,
          cantidadVentas: 1,
          promedioVenta: { $round: ["$promedioVenta", 2] },
          ventasNetas: { $subtract: ["$totalVentas", "$totalDescuentos"] }
        }
      }
    ]);

    // Si no hay resultados, retornar valores en 0
    const response = result.length > 0 
      ? result[0] 
      : { 
          totalVentas: 0, 
          totalDescuentos: 0, 
          cantidadVentas: 0, 
          promedioVenta: 0,
          ventasNetas: 0
        };

    return response
  } catch (error) {
    return { 
      totalVentas: 0, 
      totalDescuentos: 0, 
      cantidadVentas: 0, 
      promedioVenta: 0,
      ventasNetas: 0
    };
  }
};


//manda las ventas por los doce meses del año
const getSellingByYear = async (year) => {
  try {
    const ventasPorMes = await Venta.aggregate([
      {
        $match: {
          fecha: {
            $gte: new Date(`${year}-01-01`), // Fecha inicial del año
            $lt: new Date(`${year + 1}-01-01`) // Fecha inicial del siguiente año
          },
          // estado: { $nin: ['cancelado'] }
          estado: { $nin: ['cancelado', 'pendiente'] }
        }
      },
      {
        $group: {
          _id: { $month: "$fecha" }, // Agrupar por mes (1-12)
          totalVentas: { $sum: "$total" }, // Sumar el total de ventas
          cantidadVentas: { $sum: 1 } // Contar el número de ventas
        }
      }
    ]);

    const months = [
      { mes: 1, totalVentas: 0, cantidadVentas: 0 },
      { mes: 2, totalVentas: 0, cantidadVentas: 0 },
      { mes: 3, totalVentas: 0, cantidadVentas: 0 },
      { mes: 4, totalVentas: 0, cantidadVentas: 0 },
      { mes: 5, totalVentas: 0, cantidadVentas: 0 },
      { mes: 6, totalVentas: 0, cantidadVentas: 0 },
      { mes: 7, totalVentas: 0, cantidadVentas: 0 },
      { mes: 8, totalVentas: 0, cantidadVentas: 0 },
      { mes: 9, totalVentas: 0, cantidadVentas: 0 },
      { mes: 10, totalVentas: 0, cantidadVentas: 0 },
      { mes: 11, totalVentas: 0, cantidadVentas: 0 },
      { mes: 12, totalVentas: 0, cantidadVentas: 0 }
    ];

    ventasPorMes.forEach(venta => {
      const mesIndex = venta._id - 1;
      months[mesIndex].totalVentas = venta.totalVentas;
      months[mesIndex].cantidadVentas = venta.cantidadVentas;
    });

    return months;
  } catch (error) {
    console.error("Error al obtener ventas por mes:", error);
    throw error;
  }
};


const getSellAndPurchaseByYear = async (year) => {
  try{

    const sellsTotalYear = await Venta.aggregate([
      {
        $match: {
          fecha: {
            $gte: new Date(`${year}-01-01`), // Fecha de inicio del año
            $lt: new Date(`${year + 1}-01-01`) // Fecha de inicio del siguiente año
          },
          // estado: { $nin: ['cancelado'] } // Excluir ventas canceladas
          estado: { $nin: ['cancelado', 'pendiente'] } // Excluir ventas canceladas
        }
      },
      {
        $group: {
        _id: null, // Agrupamos todos los documentos
        total: { $sum: "$total" } // Sumamos el campo total
      }
      },
    ]);

    const purchasesTotalYear = await Purchase.aggregate([
      {
        $match: {
          purchaseDate: {
            $gte: new Date(`${year}-01-01`), // Fecha de inicio del año
            $lt: new Date(`${year + 1}-01-01`) // Fecha de inicio del siguiente año
          },
          // status: { $nin: ["Canceled"] }
          status: 'Active'
        }
      },{
        $group: {
          _id: null, // Agrupamos todos los documentos
          total: { $sum: "$total" } // Sumamos el campo total
        }
      }
    ])

    return { sellsTotalYear: sellsTotalYear[0]?.total || 0, purchasesTotalYear: purchasesTotalYear[0]?.total || 0 };
  }
  catch(e){
    return { sellsTotalYear: 0, purchasesTotalYear: 0 };
  }
}

async function getTopThreeProductsSell () {
  try {
    const topProducts = await Venta.aggregate([
      // { $match: { estado: { $nin: ['cancelado'] } } }, // Filtrar ventas no canceladas
      { $match: { estado: { $nin: ['cancelado', 'pendiente'] } } }, // Filtrar ventas no canceladas
      // Descomponer el array de productos
      { $unwind: '$productos' },
      // Agrupar por productoId y sumar las cantidades
      {
        $group: {
          _id: '$productos.productoId',
          totalCantidad: { $sum: '$productos.cantidad' },
          nombre: { $first: '$productos.nombre' }, // Obtener el nombre del producto
        },
      },
      // Ordenar por totalCantidad en orden descendente
      { $sort: { totalCantidad: -1 } },
      // Limitar a los 3 productos más vendidos
      { $limit: 3 },
    ]);

    return topProducts;
  } catch (error) {
    console.error('Error al obtener los productos más vendidos:', error);
    return [];
  }
}

async function getTopClientsSell() {
  try{
    const topClientes = await Venta.aggregate([{
        $match: {
          estado: { $nin: ['cancelado', 'pendiente'] } // Excluir ventas canceladas
          // estado: { $nin: ['cancelado'] } // Excluir ventas canceladas
        }
      },
      {
        $group: {
          _id: "$cliente",
          totalCompras: { $sum: "$total" },
          cantidadCompras: { $sum: 1 },
          ultimaCompra: { $max: "$fecha" }
        }
      },
      {
        $sort: { totalCompras: -1 } // Ordenar de mayor a menor por total gastado
      },
      {
        $limit: 5 // Limitar a los 10 mejores clientes
      },
      {
        $lookup: { // Opcional: para obtener datos del cliente
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "clienteInfo"
        }
      },
      {
        $unwind: "$clienteInfo" // Desenrollar el array de clienteInfo
      },
      {
        $project: { // Proyectar solo los campos que necesitas
          clienteId: "$_id",
          nombreCompleto: {
            $concat: ["$clienteInfo.firstName", " ", "$clienteInfo.lastName"]
          },
          email: "$clienteInfo.email",
          totalCompras: 1,
          cantidadCompras: 1,
          ultimaCompra: 1,
          _id: 0
        }
      }
    ]);

    return topClientes;
  }
  catch(e){
    return [];
  }
}

const getSellTypes = async ( req, res ) =>{
  try{
    // Para ventas web
    const totalWeb = await Venta.aggregate([
      { $match: { 
        isWeb: true,
        estado: { $nin: ['cancelado', 'pendiente'] }
      } },
      { $group: { _id: null, total: { $sum: "$total" } } }
    ]);

    // Para ventas en tienda
    const totalTienda = await Venta.aggregate([
      { $match: { 
        isWeb: false,
        estado: { $nin: ['cancelado', 'pendiente'] }
      } },
      { $group: { _id: null, total: { $sum: "$total" } } }
    ]);


    return {
      totalWeb: totalWeb[0]?.total || 0,
      totalTienda: totalTienda[0]?.total || 0
    }
  }
  catch(e){
    return {
      totalWeb: 0,
      totalTienda: 0
    }
  }
}

const getDashboard = async ( req, res ) =>{
  try{
    // const [ client, product, purchase, sell, devolution, topProducts ] = await Promise.all([ 
    // const [ topProducts ] = await Promise.all([ 
    //   // getQuantityClient(), getQuantityProduct(), getQuantityPurchase(), 
    //   // getQuantitySell(), getQuantityDevolution(),
    //   getTopThreeProductsSell()
    // ])

    const topProducts = await getTopThreeProductsSell()
    const topClient = await getTopClientsSell()

    const sellWebAndStore = await getSellTypes()

    const purchasesByMonth = await getPurchasesByMonth( 2025, 5 )
    const sellByMonth = await getSellMonth( 2025, 5 )
    
    const sellByYear = await getSellingByYear( 2025 )

    const sellAndPurchaseYear = await getSellAndPurchaseByYear( 2025 )


    const data = { 
      // client,
      // product,
      // purchase,
      // sell,
      // devolution,
      topProducts,
      topClient,
      purchasesByMonth,
      sellByMonth,
      sellByYear,
      sellAndPurchaseYear,
      sellWebAndStore
    }

    return res.status(200).json({ data: data, success: true });
  }
  catch(e){
    console.log(e);
    
    return res.status(404).json({message:'Error al obtener el dashboard', error: e.message, success: false});
  }
}

const getDashboardSellAndPurchase = async ( req, res ) =>{
  try{
    let { month, year } = req.query; // Esperamos que el mes y el año se pasen como parámetros

    month = parseInt( month )
    year = parseInt( year )

    // Crear fechas de inicio y fin del mes
    // const fechaInicio = new Date(year, month - 1, 1); // Mes - 1 porque los meses en JS son 0-indexados
    const fechaInicio = new Date(year, month, 1); // Mes - 1 porque los meses en JS son 0-indexados
    const fechaFin = new Date(year, month + 1, 1); // Primer día del siguiente mes    

    // Buscar ventas en el rango de fechas
    const ventas = await Venta.aggregate([
      {
        $match: {
          fecha: {
            $gte: fechaInicio,
            $lt: fechaFin
          },
          estado: {
            $nin: ['cancelado', 'pendiente']
          }
        },
      },
      {
        $group: {
          _id: { $dayOfMonth: "$fecha" }, // Agrupar por día del mes
          totalVentas: { $sum: "$total" }, // Sumar el total de ventas
          cantidadVentas: { $sum: 1 }, // Contar la cantidad de ventas
          // ventas: { $push: "$ROOT" } // Opcional: incluir todas las ventas del día
        }
      },
      {
        $sort: { _id: 1 } // Ordenar por día
      }
    ]);

    // Usar agregación para agrupar compras por día
    const compras = await Purchase.aggregate([
      {
        $match: {
          purchaseDate: {
            $gte: fechaInicio,
            $lt: fechaFin
          },
          status: 'Active'
        }
      },
      {
        $group: {
          _id: { $dayOfMonth: "$purchaseDate" }, // Agrupar por día del mes
          totalCompras: { $sum: "$total" }, // Sumar el total de compras
          cantidadCompras: { $sum: 1 }, // Contar la cantidad de compras
          // compras: { $push: "$ROOT" } // Opcional: incluir todas las compras del día
        }
      },
      {
        $sort: { _id: 1 } // Ordenar por día
      }
    ]);



    return res.status(200).json({ success: true, data: { ventas, compras }});
  }
  catch(e){
    return res.status(404).json({message:'Error al obtener el dashboard', error: e.message, success: false});
  }
}

const getDashboardGeneralInfo = async ( req, res ) =>{
  try{
    let { init, end } = req.query;

    init = new Date( init )
    end = new Date( end )

    const [ purchase, sell, devolution ] = await Promise.all([
      getQuantityPurchase( init, end ), 
      getQuantitySell( init, end ),
      getQuantityDevolution( init, end ),
    ])

    return res.status(200).json({ success: true, data: { purchase, sell, devolution } });    
  }
  catch(e){
    return res.status(404).json({message:'Error al obtener el dashboard', error: e.message, success: false});
  }
}

export default getDashboard

export { getDashboardSellAndPurchase, getDashboardGeneralInfo }