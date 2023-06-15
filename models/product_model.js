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
      const products = await client.query(query);
      resolve(JSON.stringify(products.rows));
    }, 1000);
  });
}

function getProductsWithStockPos(params) {
  var query;
  if (params.id === "all") {
    query = `select a.*, b."cant_Actual" from Productos a inner join Stock_Bodega b 
    on a."idProducto"=b."idProducto" where "idBodega"='${params.idAlmacen}' union 
    select  a.*, b."cant_Actual" from Productos a inner join Stock_Agencia b 
    on a."idProducto"=b."idProducto" where "idAgencia"='${params.idAlmacen}' union 
    select  a.*, b."cant_Actual" from Productos a inner join Stock_Agencia_Movil b 
    on a."idProducto"=b."idProducto" where "idVehiculo"='${params.idAlmacen}' order by "nombreProducto"`;
  } else {
    query = `select a."codInterno", a."nombreProducto", a."codigoBarras", b."cant_Actual", a."precioDeFabrica", 
    a."tipoProducto", a."precioDescuentoFijo", a."unidadDeMedida" from Productos a inner join Stock_Bodega b 
    on a."idProducto"=b."idProducto" where "idBodega"=${params.idAlmacen} and a."idProducto"=${params.id} order by "nombreProducto"`;
  }

  return new Promise((resolve, reject) => {
    console.log("Query", query);
    setTimeout(async () => {
      const products = await client.query(query);
      resolve(JSON.stringify(products.rows));
    }, 1000);
  });
}

function getAvailableProductsPos(id) {
  var queryProds = `select a.*, b."idBodega", b."cant_Actual" ,c."idUsuario" from Productos a 
  inner join Stock_Bodega b on a."idProducto"=b."idProducto"
  inner join Usuarios c on c."idAlmacen"=b."idBodega"
  where c."idUsuario"=${id} and b."cant_Actual">=0 union
  select a.*, b."idAgencia", b."cant_Actual" ,c."idUsuario" from Productos a 
  inner join Stock_Agencia b on a."idProducto"=b."idProducto"
  inner join Usuarios c on c."idAlmacen"=b."idAgencia"
  where c."idUsuario"=${id} and b."cant_Actual">=0  union
  select a.*, b."idAgencia", b."cant_Actual" ,c."idUsuario" from Productos a 
  inner join Stock_Agencia b on a."idProducto"=b."idProducto"
  inner join Usuarios c on c."idAlmacen"=b."idAgencia"
  where c."idUsuario"=${id} and b."cant_Actual">=0 order by "codInterno" `;
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      const products = await client.query(queryProds);
      resolve(JSON.stringify(products.rows));
    }, 1000);
  });
}

function getNumberOfProductsPos() {
  const countQuery = `select count(*) as "NumeroProductos" from Productos`;
  return new Promise((resolve) => {
    setTimeout(async () => {
      const prods = await client.query(countQuery);
      resolve(
        JSON.stringify({
          code: 200,
          data: prods.rows,
        })
      );
    }, 1000);
  });
}

function getProductsDiscountPos(params) {
  const discQuery = `
  select ld.descuento, ld."idTiposProducto", rn.*, us."tipoUsuario" from Lista_Descuento ld 
inner join Rangos rn on rn."idRango"=ld."idRango"
inner join Usuarios us on ld."idTipoVendedor"=us."tipoUsuario"
where us."idUsuario"=${params.id} order by us."tipoUsuario"

  `;
  return new Promise((resolve) => {
    setTimeout(async () => {
      const prods = await client.query(discQuery);
      resolve(
        JSON.stringify({
          code: 200,
          data: prods.rows,
        })
      );
    }, 1000);
  });
}

function createProductPos(body) {
  const newProdQuery = `insert into Productos ("codInterno", "nombreProducto", "descProducto", "gramajeProducto", 
    "precioDeFabrica", "codigoBarras", "cantCajon", "unidadDeMedida", "tiempoDeVida", activo, "precioPDV", "cantDisplay", 
    "aplicaDescuento", "tipoProducto", "precioDescuentoFijo","actividadEconomica","codigoSin","codigoUnidad","origenProducto") values (
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
    ) returning "idProducto"`;
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      try {
        const added = await client.query(newProdQuery);
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
    const { nombreProducto, activo, aplicaDescuento, codigoBarras, gramajeProducto, precioDeFabrica, precioPDV } = body;

    const query = `
    UPDATE productos
    SET "nombreProducto" = '${nombreProducto}', 
    "activo" = ${activo}, "aplicaDescuento" = '${aplicaDescuento}', 
    "codigoBarras" = '${codigoBarras}', "gramajeProducto" = ${gramajeProducto}, 
    "precioDeFabrica" = ${precioDeFabrica}, "precioPDV" = ${precioPDV}
    WHERE "idProducto" = ${id}
  `;
    const data = await client.query(query)
    return data.rows;
  } catch (err) {
    throw err;
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
  updateProduct
};
