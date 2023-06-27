const { query } = require("express");
const { client } = require("../postgressConn");
const dbConnection = require("../server");

function getStockFromDateAndProduct(params) {
  console.log("Params", params);
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
  let logQuery = `select b.codInterno,  b.nombreProducto, a.cant_Actual as cantidad , b.precioDeFabrica, c.nombre as NombreAgencia, b.idProducto from Stock_Agencia a 
    inner join Productos b on a.idProducto=b.idProducto
    inner join Agencias c on a.idAgencia=c.idAgencia
    where a.idAgencia='${params.idAgencia}' union 
    select b.codInterno,  b.nombreProducto, a.cant_Actual as cantidad, b.precioDeFabrica, c.nombre as NombreAgencia, b.idProducto from Stock_Bodega a 
    inner join Productos b on a.idProducto=b.idProducto
    inner join Bodegas c on a.idBodega=c.idBodega
    where a.idBodega='${params.idAgencia}' union 
    select b.codInterno,  b.nombreProducto, a.cant_Actual as cantidad, b.precioDeFabrica, 
    (select am.marca+' '+am.color+' '+am.placa from Vehiculos am where am.placa=a.idVehiculo) as NombreAgencia, b.idProducto
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

function initializeStock(body) {
  const initQuery = `insert into Stock_Agencia (
    idAgencia, 
    idProducto, 
    cant_Anterior, 
    cant_Actual, 
    diferencia, 
    fechaActualizacion 
  ) select idAgencia, ${body.idProducto}, 0, 0, 0, '${body.fechaHora}' from Agencias
  insert into Stock_Agencia_Movil(
    idVehiculo, 
    idProducto, 
    cant_Anterior, 
    cant_Actual, 
    diferencia, 
    fechaActualizacion 
  ) select placa, ${body.idProducto}, 0, 0, 0,'${body.fechaHora}' from Vehiculos
  insert into Stock_Bodega (
    idBodega, 
    idProducto, 
    cant_Anterior, 
    cant_Actual, 
    diferencia, 
    fechaActualizacion 
  ) select idBodega,${body.idProducto}, 0, 0, 0, '${body.fechaHora}' from Bodegas`;
  console.log("Query query", initQuery);
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      const log = await dbConnection.executeQuery(initQuery);
      if (log.success) {
        resolve(log);
      } else {
        reject(log);
      }
    }, 100);
  });
}

//POSTGRES

function getStockFromDateAndProductPos(params) {
  let logQuery = `select a.fecha, a.cantidad, b."nombreProducto", b."precioDeFabrica", b."codInterno",
  (select bd.nombre from Bodegas bd where bd."idBodega"=a."idAgencia" 
  union select ag.nombre from Agencias ag where ag."idAgencia"=a."idAgencia"
  union select am.marca||' '||am.color||' '||am.placa from Vehiculos am where am.placa=a."idAgencia"
  ) as "NombreAgencia"
  from Log_Kardex a  
  inner join Productos b on a."idProducto"=b."idProducto" 
  where  a."idProducto"=${params.idProducto} and a.fecha='${params.fecha}'::date
  `;
  console.log("Query", logQuery);
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      const log = await client.query(logQuery);
      resolve(JSON.stringify(log.rows));
    }, 1000);
  });
}

function getStockFromDateAndStorePos(params) {
  let logQuery = `select a.fecha, a.cantidad, b."nombreProducto", b."precioDeFabrica", b."codInterno", 
  (select nombre from Agencias where "idAgencia"='${params.idAgencia}' 
  union select nombre from Bodegas where "idBodega"='${params.idAgencia}'
   union select marca||' '||color||' '||placa from Vehiculos where placa='${params.idAgencia}') as "NombreAgencia" from Log_Kardex a 
      inner join Productos b on a."idProducto"=b."idProducto"
    where fecha=${params.fecha}::date and "idAgencia"='${params.idAgencia}'`;
  console.log("Query", logQuery);
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      const log = await client.query(logQuery);
      resolve(JSON.stringify(log.rows));
    }, 1000);
  });
}

function getCurrentProductStockPos(params) {
  let logQuery = `select b."codInterno",  b."nombreProducto", a."cant_Actual" as cantidad, b."precioDeFabrica", c.nombre as "NombreAgencia" from Stock_Agencia a 
    inner join Productos b on a."idProducto"=b."idProducto"
    inner join Agencias c on a."idAgencia"=c."idAgencia"
    where b."idProducto"=${params.idProducto} union 
    select b."codInterno",  b."nombreProducto", a."cant_Actual" as cantidad, b."precioDeFabrica", c.nombre as "NombreAgencia" from Stock_Bodega a 
    inner join Productos b on a."idProducto"=b."idProducto"
    inner join Bodegas c on a."idBodega"=c."idBodega"
    where b."idProducto"=${params.idProducto}  union 
    select b."codInterno",  b."nombreProducto", a."cant_Actual" as cantidad, b."precioDeFabrica", 
    (select am.marca||' '||am.color||' '||am.placa from Vehiculos am where am.placa=a."idVehiculo") as "NombreAgencia" 
    from Stock_Agencia_Movil a 
    inner join Productos b on a."idProducto"=b."idProducto"
    where b."idProducto"=${params.idProducto} `;
  console.log("Query", logQuery);
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      const log = await client.query(logQuery);
      resolve(JSON.stringify(log.rows));
    }, 1000);
  });
}

function getCurrentStoreStockPos(params) {
  let logQuery = `select b."codInterno",  b."nombreProducto", a."cant_Actual" as cantidad , b."precioDeFabrica", c.nombre as "NombreAgencia", b."idProducto" from Stock_Agencia a 
    inner join Productos b on a."idProducto"=b."idProducto"
    inner join Agencias c on a."idAgencia"=c."idAgencia"
    where a."idAgencia"='${params.idAgencia}' union 
    select b."codInterno",  b."nombreProducto", a."cant_Actual" as cantidad, b."precioDeFabrica", c.nombre as "NombreAgencia", b."idProducto" from Stock_Bodega a 
    inner join Productos b on a."idProducto"=b."idProducto"
    inner join Bodegas c on a."idBodega"=c."idBodega"
    where a."idBodega"='${params.idAgencia}' union 
    select b."codInterno",  b."nombreProducto", a."cant_Actual" as cantidad, b."precioDeFabrica", 
    (select am.marca||' '||am.color||' '||am.placa from Vehiculos am where am.placa=a."idVehiculo") as "NombreAgencia", b."idProducto"
    from Stock_Agencia_Movil a 
    inner join Productos b on a."idProducto"=b."idProducto"
    where a."idVehiculo"='${params.idAgencia}'
    `;
  console.log("Query", logQuery);
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      const log = await client.query(logQuery);
      resolve(JSON.stringify(log.rows));
    }, 1000);
  });
}

function initializeStockPos(body) {
  const initQuery = `insert into Stock_Agencia (
    "idAgencia", 
    "idProducto", 
    "cant_Anterior", 
    "cant_Actual", 
    diferencia, 
    "fechaActualizacion" 
  ) select "idAgencia", ${body.idProducto}, 0, 0, 0, '${body.fechaHora}' from Agencias;
  insert into Stock_Agencia_Movil(
    "idVehiculo", 
    "idProducto", 
    "cant_Anterior", 
    "cant_Actual", 
    diferencia, 
    "fechaActualizacion" 
  ) select placa, ${body.idProducto}, 0, 0, 0,'${body.fechaHora}' from Vehiculos;
  insert into Stock_Bodega (
    "idBodega", 
    "idProducto", 
    "cant_Anterior", 
    "cant_Actual", 
    diferencia, 
    "fechaActualizacion" 
  ) select "idBodega",${body.idProducto}, 0, 0, 0, '${body.fechaHora}' from Bodegas;`;
  console.log("Query query", initQuery);
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      try {
        const log = await client.query(initQuery);
        resolve(log.rows);
      } catch (err) {
        reject(err);
      }
    }, 100);
  });
}

function logProductEntry(body) {
  const entryQuery = `insert into ingresos ("idUsuarioCrea", "fechaCrea") values (${body.idUsuarioCrea}, '${body.fechaCrea}') returning "idIngreso"`;
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      try {
        const log = await client.query(entryQuery);
        const idCreado = log.rows[0].idIngreso;
        for (product of body.products) {
          const productQuery = `insert into ingreso_productos ("idIngreso", "idProducto","cantidadProducto") 
          values (${idCreado},${product.idProducto} ,${product.cantProducto}) returning "idIngresoProducto"`;
          try {
            const logged = await client.query(productQuery);
            if (body.products.indexOf(product) === body.products.length - 1) {
              resolve({ logged, id: idCreado });
            }
          } catch (error) {
            const deleteEntry = `delete from ingresos where "idIngreso"=${idCreado}`;
            const deleteProduct = `delete from ingreso_productos where "idIngreso"=${idCreado}`;
            const deletedEntry = await client.query(deleteEntry);
            const deletedProduct = await client.query(deleteProduct);
            reject(error);
          }
        }
      } catch (err) {
        reject(err);
      }
    }, 100);
  });
}

function getLoggedEntries() {
  const getQuery = `select ig."idIngreso","codInterno", "nombreProducto", "cantidadProducto", "fechaCrea", "usuario"
  from ingresos ig inner join ingreso_productos ip on ip."idIngreso"=ig."idIngreso"
  inner join Productos pr on pr."idProducto"=ip."idProducto"
  inner join Usuarios us on us."idUsuario"=ig."idUsuarioCrea"`;
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      try {
        const log = await client.query(getQuery);
        resolve(log.rows);
      } catch (err) {
        reject(err);
      }
    }, 100);
  });
}

function getStockCodes() {
  const getQuery = `select * from Codigos_Stock`;
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      try {
        const log = await client.query(getQuery);
        resolve(log.rows);
      } catch (err) {
        reject(err);
      }
    }, 100);
  });
}

function getStockLogged(params) {
  const getQuery = `
  select lsc.*, pr."codInterno", pr."nombreProducto", 
  (select "nombre" from Bodegas where "idBodega"=lsc."idAgencia" 
  union select "nombre" from Agencias where "idAgencia"=lsc."idAgencia" 
  union select placa from Vehiculos where "placa"=lsc."idAgencia" ) as "agencia"
  from Log_Stock_Change lsc 
  inner join Productos pr on pr."idProducto"=lsc."idProducto"
  where lsc."idAgencia"='${params.idAgencia}' and
  to_date("fechaHora",'DD/MM/YYYY') between to_date('${params.fromDate}', 'YYYY-MM-DD') and to_date('${params.toDate}', 'YYYY-MM-DD') 
  
  `;
  return new Promise((resolve, reject) => {
    console.log("Flag", getQuery);
    setTimeout(async () => {
      try {
        const log = await client.query(getQuery);
        resolve(log.rows);
      } catch (err) {
        reject(err);
      }
    }, 100);
  });
}

async function getStockGrupos() {
  const query = `select * from grupos g`;
  try {
    const data = await client.query(query);
    return data.rows;
  } catch (err) {
    throw err;
  }
}

async function getStockGrupoProductos() {
  const query = `select * from grupo_productos gp`;
  try {
    const data = await client.query(query);
    return data.rows;
  } catch (err) {
    throw err;
  }
}

module.exports = {
  getStockFromDateAndProduct,
  getStockFromDateAndStore,
  getCurrentProductStock,
  getCurrentStoreStock,
  initializeStock,
  getStockFromDateAndProductPos,
  getStockFromDateAndStorePos,
  getCurrentProductStockPos,
  getCurrentStoreStockPos,
  initializeStockPos,
  logProductEntry,
  getLoggedEntries,
  getStockCodes,
  getStockLogged,
  getStockGrupos,
  getStockGrupoProductos
};
