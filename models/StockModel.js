const dbConnection = require("../server");

function getStockFromDateAndProduct(params) {
  let logQuery = `select a.fecha, a.cantidad, b.nombreProducto, b.precioDeFabrica, b.codInterno,
  (select bd.nombre from Bodegas bd where bd.idBodega=a.idAgencia 
  union select ag.nombre from Agencias ag where ag.idAgencia=a.idAgencia
  union select am.marca+' '+am.color+' '+am.placa from Vehiculos am where am.placa=a.idAgencia
  ) as NombreAgencia
  from Log_Kardex a  
  inner join Productos b on a.idProducto=b.idProducto 
  where  a.idProducto=${params.idProducto} and a.fecha=CONVERT(datetime, '${params.fecha}') 
  `;
  console.log("Query", logQuery);
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      const log = await dbConnection.executeQuery(logQuery);
      resolve(JSON.stringify(log.data));
    }, 1000);
  });
}
function getStockFromDateAndStore(params) {
  let logQuery = `select a.fecha, a.cantidad, b.nombreProducto, b.precioDeFabrica, b.codInterno, 
  (select nombre from Agencias where idAgencia='${params.idAgencia}' 
  union select nombre from Bodegas where idBodega='${params.idAgencia}'
   union select marca+' '+color+' '+placa from Vehiculos where placa='${params.idAgencia}') as NombreAgencia from Log_Kardex a 
      inner join Productos b on a.idProducto=b.idProducto
    where fecha=CONVERT(datetime, ${params.fecha}) and idAgencia='${params.idAgencia}'`;
  console.log("Query", logQuery);
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      const log = await dbConnection.executeQuery(logQuery);
      resolve(JSON.stringify(log.data));
    }, 1000);
  });
}

function getCurrentProductStock(params) {
  let logQuery = `select b.codInterno,  b.nombreProducto, a.cant_Actual as cantidad, b.precioDeFabrica, c.nombre as NombreAgencia from Stock_Agencia a 
    inner join Productos b on a.idProducto=b.idProducto
    inner join Agencias c on a.idAgencia=c.idAgencia
    where b.idProducto=${params.idProducto} union 
    select b.codInterno,  b.nombreProducto, a.cant_Actual as cantidad, b.precioDeFabrica, c.nombre as NombreAgencia from Stock_Bodega a 
    inner join Productos b on a.idProducto=b.idProducto
    inner join Bodegas c on a.idBodega=c.idBodega
    where b.idProducto=${params.idProducto}  union 
    select b.codInterno,  b.nombreProducto, a.cant_Actual as cantidad, b.precioDeFabrica, 
    (select am.marca+' '+am.color+' '+am.placa from Vehiculos am where am.placa=a.idVehiculo) as NombreAgencia 
    from Stock_Agencia_Movil a 
    inner join Productos b on a.idProducto=b.idProducto
    where b.idProducto=${params.idProducto} `;
  console.log("Query", logQuery);
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      const log = await dbConnection.executeQuery(logQuery);
      resolve(JSON.stringify(log.data));
    }, 1000);
  });
}
function getCurrentStoreStock(params) {
  let logQuery = `select b.codInterno,  b.nombreProducto, a.cant_Actual as cantidad , b.precioDeFabrica, c.nombre as NombreAgencia from Stock_Agencia a 
    inner join Productos b on a.idProducto=b.idProducto
    inner join Agencias c on a.idAgencia=c.idAgencia
    where a.idAgencia='${params.idAgencia}' union 
    select b.codInterno,  b.nombreProducto, a.cant_Actual as cantidad, b.precioDeFabrica, c.nombre as NombreAgencia from Stock_Bodega a 
    inner join Productos b on a.idProducto=b.idProducto
    inner join Bodegas c on a.idBodega=c.idBodega
    where a.idBodega='${params.idAgencia}' union 
    select b.codInterno,  b.nombreProducto, a.cant_Actual as cantidad, b.precioDeFabrica, 
    (select am.marca+' '+am.color+' '+am.placa from Vehiculos am where am.placa=a.idVehiculo) as NombreAgencia 
    from Stock_Agencia_Movil a 
    inner join Productos b on a.idProducto=b.idProducto
    where a.idVehiculo='${params.idAgencia}'
    `;
  console.log("Query", logQuery);
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      const log = await dbConnection.executeQuery(logQuery);
      resolve(JSON.stringify(log.data));
    }, 1000);
  });
}

module.exports = {
  getStockFromDateAndProduct,
  getStockFromDateAndStore,
  getCurrentProductStock,
  getCurrentStoreStock,
};
