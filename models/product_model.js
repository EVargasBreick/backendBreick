const { client } = require("../postgressConn");
const dbConnection = require("../server");

function getProducts(params) {
  var query;
  if (params.id === "all") {
    query = `select * from Productos`;
  } else {
    query = `select * from Productos where idProducto=${params.id}`;
  }

  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      const products = await dbConnection.executeQuery(query);
      resolve(JSON.stringify(products.data));
    }, 1000);
  });
}

function getProductsWithStock(params) {
  var query;
  if (params.id === "all") {
    query = `select a.*, b.cant_Actual from Productos a inner join Stock_Bodega b 
    on a.idProducto=b.idProducto where idBodega='${params.idAlmacen}' union 
    select  a.*, b.cant_Actual from Productos a inner join Stock_Agencia b 
    on a.idProducto=b.idProducto where idAgencia='${params.idAlmacen}' union 
    select  a.*, b.cant_Actual from Productos a inner join Stock_Agencia_Movil b 
    on a.idProducto=b.idProducto where idVehiculo='${params.idAlmacen}'`;
  } else {
    query = `select a.codInterno, a.nombreProducto, a.codigoBarras, b.cant_Actual, a.precioDeFabrica, a.tipoProducto, a.precioDescuentoFijo, a.unidadDeMedida from Productos a inner join Stock_Bodega b 
    on a.idProducto=b.idProducto where idBodega=${params.idAlmacen} and a.idProducto=${params.id}`;
  }

  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      const products = await dbConnection.executeQuery(query);
      resolve(JSON.stringify(products.data));
    }, 1000);
  });
}

function getAvailableProducts(id) {
  var queryProds = `select a.*, b.idBodega, b.cant_Actual ,c.idUsuario from Productos a 
  inner join Stock_Bodega b on a.idProducto=b.idProducto
  inner join Usuarios c on c.idAlmacen=b.idBodega
  where c.idUsuario=${id} and b.cant_Actual>=0 union
  select a.*, b.idAgencia, b.cant_Actual ,c.idUsuario from Productos a 
  inner join Stock_Agencia b on a.idProducto=b.idProducto
  inner join Usuarios c on c.idAlmacen=b.idAgencia
  where c.idUsuario=${id} and b.cant_Actual>=0  union
  select a.*, b.idAgencia, b.cant_Actual ,c.idUsuario from Productos a 
  inner join Stock_Agencia b on a.idProducto=b.idProducto
  inner join Usuarios c on c.idAlmacen=b.idAgencia
  where c.idUsuario=${id} and b.cant_Actual>=0 order by a.codInterno `;
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      const products = await dbConnection.executeQuery(queryProds);
      resolve(JSON.stringify(products.data));
    }, 1000);
  });
}

function getNumberOfProducts() {
  const countQuery = `select count(*) as NumeroProductos from Productos`;
  return new Promise((resolve) => {
    setTimeout(async () => {
      const prods = await dbConnection.executeQuery(countQuery);
      resolve(
        JSON.stringify({
          code: 200,
          data: prods.data,
        })
      );
    }, 1000);
  });
}

function getProductsDiscount(params) {
  const discQuery = `
  select ld.descuento, ld.idTiposProducto, rn.*, us.tipoUsuario from Lista_Descuento ld 
inner join Rangos rn on rn.idRango=ld.idRango
inner join Usuarios us on ld.idTipoVendedor=us.tipoUsuario
where us.idUsuario=${params.id} order by us.tipoUsuario

  `;
  return new Promise((resolve) => {
    setTimeout(async () => {
      const prods = await dbConnection.executeQuery(discQuery);
      resolve(
        JSON.stringify({
          code: 200,
          data: prods.data,
        })
      );
    }, 1000);
  });
}

function createProduct(body) {
  const newProdQuery = `insert into Productos (codInterno, nombreProducto, descProducto, gramajeProducto, 
    precioDeFabrica, codigoBarras, cantCajon, unidadDeMedida, tiempoDeVida, activo, precioPDV, cantDisplay, 
    aplicaDescuento, tipoProducto, precioDescuentoFijo,actividadEconomica,codigoSin,codigoUnidad,origenProducto) values (
      '${body.codInterno}',
      '${body.nombreProducto}',
      '${body.descProducto}',
      '${body.gramajeProducto}',
      ${body.precioDeFabrica},
      '${body.codigoBarras}',
      ${body.cantCajon},
      '${body.unidadDeMedida}',
      ${body.tiempoDeVida},
      ${body.activo},
      ${body.precioPDV},
      ${body.cantDisplay},
      '${body.aplicaDescuento}',
      ${body.tipoProducto},
      ${body.precioDescuentoFijo},
      ${body.actividadEconomica},
      ${body.codigoSin},
      ${body.codigoUnidad},
      ${body.origenProducto}
    )`;
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      const added = await dbConnection.executeQuery(newProdQuery);
      if (added.success) {
        const idCreado = await dbConnection.executeQuery(
          `select IDENT_CURRENT('dbo.Productos') as 'idCreado'`
        );
        const id = idCreado.data[0][0].idCreado;
        resolve({ added, id: id });
      } else {
        reject(added);
      }
    }, 100);
  });
}

function getInternalAndBarcode() {
  const getQuery = `select idProducto, nombreProducto, codInterno, codigoBarras from Productos`;
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      const ids = await dbConnection.executeQuery(getQuery);
      if (ids.success) {
        resolve(ids);
      } else {
        reject(ids);
      }
    }, 100);
  });
}

function getProdTypes() {
  const typeQuery = `select * from Tipos_Producto order by idTiposProducto`;
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      const ids = await dbConnection.executeQuery(typeQuery);
      if (ids.success) {
        resolve(ids);
      } else {
        reject(ids);
      }
    }, 100);
  });
}

function getProdOrigin() {
  const typeQuery = `select * from Origen_Producto order by idOrigenProducto`;
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      const ids = await dbConnection.executeQuery(typeQuery);
      if (ids.success) {
        resolve(ids);
      } else {
        reject(ids);
      }
    }, 100);
  });
}

//POSTGRES

function getProductsPos(params) {
  var query;
  if (params.id === "all") {
    query = `select * from Productos order by "nombreProducto" asc`;
  } else {
    query = `select * from Productos where "idProducto"=${params.id}`;
  }
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      try {
        const products = await client.query(query);
        resolve(JSON.stringify(products.rows));
      } catch (error) {
        reject(error);
      }
    }, 200);
  });
}

function getProductsWithStockPos(params) {
  var query;
  const idAlmacen = params.idAlmacen;
  if (params.id === "all") {
    if (idAlmacen.includes("AG")) {
      console.log("ES AGENCIA");
      query = `select  a.*, b."cant_Actual" from Productos a inner join Stock_Agencia b 
      on a."idProducto"=b."idProducto" where "idAgencia"=$1 order by "nombreProducto"`;
    } else if (idAlmacen.includes("AL")) {
      console.log("ES ALMACEN");
      query = `select a.*, b."cant_Actual" from Productos a inner join Stock_Bodega b 
      on a."idProducto"=b."idProducto" where "idBodega"=$1 order by "nombreProducto"`;
    } else {
      query = ` select  a.*, b."cant_Actual" from Productos a inner join Stock_Agencia_Movil b 
      on a."idProducto"=b."idProducto" where "idVehiculo"=$1 order by "nombreProducto"`;
      console.log("ES RUTA");
    }
  } else {
    query = `select a."codInterno", a."nombreProducto", a."codigoBarras", b."cant_Actual", a."precioDeFabrica", 
    a."tipoProducto", a."precioDescuentoFijo", a."unidadDeMedida" from Productos a inner join Stock_Bodega b 
    on a."idProducto"=b."idProducto" where "idBodega"=${params.idAlmacen} and a."idProducto"=${params.id} order by "nombreProducto"`;
  }

  return new Promise((resolve, reject) => {
    console.log("Query", query);
    setTimeout(async () => {
      try {
        const products = await client.query(query, [idAlmacen]);
        resolve(JSON.stringify(products.rows));
      } catch (error) {
        reject(error);
      }
    }, 300);
  });
}

function getAvailableProductsPos(id) {
  var queryProds = `select a.*, b."idBodega", b."cant_Actual" ,c."idUsuario" from Productos a 
  inner join Stock_Bodega b on a."idProducto"=b."idProducto"
  inner join Usuarios c on c."idAlmacen"=b."idBodega"
  where c."idUsuario"=${id} and b."cant_Actual">=0 and a.activo=1 union
  select a.*, b."idAgencia", b."cant_Actual" ,c."idUsuario" from Productos a 
  inner join Stock_Agencia b on a."idProducto"=b."idProducto"
  inner join Usuarios c on c."idAlmacen"=b."idAgencia"
  where c."idUsuario"=${id} and b."cant_Actual">=0 and a.activo=1 union
  select a.*, b."idAgencia", b."cant_Actual" ,c."idUsuario" from Productos a 
  inner join Stock_Agencia b on a."idProducto"=b."idProducto"
  inner join Usuarios c on c."idAlmacen"=b."idAgencia"
  where c."idUsuario"=${id} and b."cant_Actual">=0 and a.activo=1 order by "codInterno" `;
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      try {
        const products = await client.query(queryProds);
        resolve(JSON.stringify(products.rows));
      } catch (error) {
        reject(error);
      }
    }, 1000);
  });
}

function getNumberOfProductsPos() {
  const countQuery = `select count(*) as "NumeroProductos" from Productos`;
  return new Promise((resolve, reject) => {
    try {
      setTimeout(async () => {
        const prods = await client.query(countQuery);
        resolve(
          JSON.stringify({
            code: 200,
            data: prods.rows,
          })
        );
      }, 100);
    } catch (error) {
      reject(error);
    }
  });
}

function getProductsDiscountPos(params) {
  const discQuery = `
  select ld.descuento, ld."idTiposProducto", rn.*, us."tipoUsuario" from Lista_Descuento ld 
inner join Rangos rn on rn."idRango"=ld."idRango"
inner join Usuarios us on ld."idTipoVendedor"=us."tipoUsuario"
where us."idUsuario"=${params.id} order by us."tipoUsuario"
  `;
  return new Promise((resolve, reject) => {
    try {
      setTimeout(async () => {
        const prods = await client.query(discQuery);
        resolve(
          JSON.stringify({
            code: 200,
            data: prods.rows,
          })
        );
      }, 200);
    } catch (error) {
      reject(error);
    }
  });
}

function createProductPos(body) {
  const newProdQueryLog = `insert into Productos ("codInterno", "nombreProducto", "descProducto", "gramajeProducto", 
    "precioDeFabrica", "codigoBarras", "cantCajon", "unidadDeMedida", "tiempoDeVida", activo, "precioPDV", "cantDisplay", 
    "aplicaDescuento", "tipoProducto", "precioDescuentoFijo","actividadEconomica","codigoSin","codigoUnidad","origenProducto","precioSuper") values (
      '${body.codInterno}',
      '${body.nombreProducto}',
      '${body.descProducto}',
      '${body.gramajeProducto}',
      ${body.precioDeFabrica},
      '${body.codigoBarras}',
      ${body.cantCajon},
      '${body.unidadDeMedida}',
      ${body.tiempoDeVida},
      ${body.activo},
      ${body.precioPDV},
      ${body.cantDisplay},
      '${body.aplicaDescuento}',
      ${body.tipoProducto},
      ${body.precioDescuentoFijo},
      ${body.actividadEconomica},
      ${body.codigoSin},
      ${body.codigoUnidad},
      ${body.origenProducto},
      ${body.precioDeFabrica}
    ) returning "idProducto"`;

  const newProdQuery = `insert into Productos ("codInterno", "nombreProducto", "descProducto", "gramajeProducto", 
    "precioDeFabrica", "codigoBarras", "cantCajon", "unidadDeMedida", "tiempoDeVida", activo, "precioPDV", "cantDisplay", 
    "aplicaDescuento", "tipoProducto", "precioDescuentoFijo","actividadEconomica","codigoSin","codigoUnidad","origenProducto","precioSuper") values (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20
    ) returning "idProducto"`;

  // Create an array of parameter values
  const params = [
    body.codInterno,
    body.nombreProducto,
    body.descProducto,
    body.gramajeProducto,
    body.precioDeFabrica,
    body.codigoBarras,
    body.cantCajon,
    body.unidadDeMedida,
    body.tiempoDeVida,
    body.activo,
    body.precioPDV,
    body.cantDisplay,
    body.aplicaDescuento,
    body.tipoProducto,
    body.precioDescuentoFijo,
    body.actividadEconomica,
    body.codigoSin,
    body.codigoUnidad,
    body.origenProducto,
    body.precioDeFabrica,
  ];

  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      try {
        console.log("New product query", newProdQueryLog);
        const added = await client.query(newProdQuery, params);
        const id = added.rows[0].idProducto;
        resolve({ added, id: id });
      } catch (err) {
        reject(err);
      }
    }, 100);
  });
}

function getInternalAndBarcodePos() {
  const getQuery = `select "idProducto", "nombreProducto", "codInterno", "codigoBarras" from Productos`;
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      try {
        const ids = await client.query(getQuery);
        resolve(ids.rows);
      } catch (err) {
        reject(err);
      }
    }, 100);
  });
}

function getProdTypesPos() {
  const typeQuery = `select * from Tipos_Producto order by "idTiposProducto"`;
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      try {
        const ids = await client.query(typeQuery);
        resolve(ids.rows);
      } catch (err) {
        reject(err);
      }
    }, 100);
  });
}

function getProdOriginPos() {
  const typeQuery = `select * from Origen_Producto order by "idOrigenProducto"`;
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      try {
        const ids = await client.query(typeQuery);
        resolve(ids.rows);
      } catch (err) {
        reject(err);
      }
    }, 100);
  });
}

async function getAllProducts() {
  const query = `select * from Productos`;
  try {
    const ids = await client.query(query);
    return ids.rows;
  } catch (err) {
    throw err;
  }
}

async function updateProduct(id, body) {
  try {
    const {
      nombreProducto,
      activo,
      aplicaDescuento,
      codigoBarras,
      gramajeProducto,
      precioDeFabrica,
      precioPDV,
    } = body;

    const query = `
    UPDATE productos
    SET "nombreProducto" = $1, 
    "activo" = ${activo}, "aplicaDescuento" = '${aplicaDescuento}', 
    "codigoBarras" = '${codigoBarras}', "gramajeProducto" = ${gramajeProducto}, 
    "precioDeFabrica" = ${precioDeFabrica}, "precioPDV" = ${precioPDV}, "precioDescuentoFijo" = ${precioDeFabrica} , "precioSuper"=${precioDeFabrica}
    WHERE "idProducto" = ${id}
  `;
    const data = await client.query(query, [nombreProducto]);
    return data.rows;
  } catch (err) {
    throw err;
  }
}

function getVirtualProductsWithStock(params) {
  const prodQuery = `select p.*, av."cant_Actual" from Productos p inner join almacen_virtual av on p."idProducto"=av."idProducto"
  where av."nitCliente"='${params.nitCliente}' and "idDepto"=(select "idDepartamento" from Zonas where "idZona"=${params.idZona})
  and "cant_Actual"::integer>0`;
  console.log("Query prod consig", prodQuery);
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      try {
        const products = await client.query(prodQuery);
        resolve(JSON.stringify(products.rows));
      } catch (error) {
        reject(error);
      }
    }, 1000);
  });
}

function getGroupedProducts() {
  const prodQuery = `select gr.*, gp.*, pr."codInterno", pr."nombreProducto",pr."precioDeFabrica" from grupos gr inner join grupo_productos gp on gp."idGrupo"=gr."idGrupo" inner join productos pr on pr."idProducto"=gp."idProducto" order by cast(gr."idGrupo" as int) asc`;
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      try {
        const products = await client.query(prodQuery);
        resolve(products.rows);
      } catch (err) {
        reject(err);
      }
    }, 1000);
  });
}

async function registerProductGroup(body) {
  const detail = body.detalles;
  const products = body.productos;
  try {
    await client.query("BEGIN");
    const queryDetail = `insert into grupos (descripcion, precio, activo) values ('${detail.descripcion}',${detail.precio},1) returning "idGrupo"`;
    const addedGroup = await client.query(queryDetail);
    const newId = addedGroup.rows[0].idGrupo;
    const prodArray = [];
    for (const product of products) {
      const queryProd = `insert into grupo_productos ("idGrupo","idProducto") values (${newId},${product.idProducto})`;
      const addedGroup = await client.query(queryProd);
      prodArray.push(addedGroup);
    }
    client.query("COMMIT");
    return prodArray;
  } catch (err) {
    await client.query("ROLLBACK");
    throw new Error(err);
  }
}

async function changeGroupStatus(groupId, status) {
  const query = `update grupos set activo=${status} where "idGrupo"=${groupId}`;
  try {
    const changed = await client.query(query);
    return changed;
  } catch (err) {
    throw new Error(err);
  }
}

async function updateGroupProducts(body) {
  const original = body.original;
  const nuevo = body.nuevo;
  const removed = original.filter(
    (item) => !nuevo.some((newItem) => newItem.idProducto === item.idProducto)
  );
  const added = nuevo.filter(
    (item) =>
      !original.some((oldItem) => oldItem.idProducto === item.idProducto)
  );
  try {
    await client.query("BEGIN");
    for (const item of removed) {
      const queryRemove = `delete from grupo_productos where "idGrupo"=${item.idGrupo} and "idProducto"=${item.idProducto}`;
      await client.query(queryRemove);
    }
    for (const item of added) {
      const queryAdd = `insert into grupo_productos ("idGrupo", "idProducto") values (${item.idGrupo},${item.idProducto})`;
      await client.query(queryAdd);
    }
    client.query("COMMIT");
    return true;
  } catch (err) {
    client.query("ROLLBACK");
    throw new Error(err);
  }
}

module.exports = {
  getProducts,
  getNumberOfProducts,
  getAvailableProducts,
  getProductsWithStock,
  getProductsDiscount,
  createProduct,
  getInternalAndBarcode,
  getProdTypes,
  getProdOrigin,
  getAllProducts,
  getProductsPos,
  getProductsWithStockPos,
  getAvailableProductsPos,
  getNumberOfProductsPos,
  getProductsDiscountPos,
  createProductPos,
  getInternalAndBarcodePos,
  getProdOriginPos,
  getProdTypesPos,
  updateProduct,
  getVirtualProductsWithStock,
  getGroupedProducts,
  registerProductGroup,
  changeGroupStatus,
  updateGroupProducts,
};
