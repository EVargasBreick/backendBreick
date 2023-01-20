const dbConnection = require("../server");

function getProducts(params) {
  console.log("Id producto:", params.id);
  var query;
  if (params.id === "all") {
    query = `select * from Productos`;
  } else {
    query = `select * from Productos where idProducto=${params.id}`;
  }

  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      console.log(query);
      const products = await dbConnection.executeQuery(query);
      resolve(JSON.stringify(products.data));
    }, 1000);
  });
}

function getProductsWithStock(params) {
  console.log("Id producto:", params.idAlmacen);
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
      console.log(query);
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

module.exports = {
  getProducts,
  getNumberOfProducts,
  getAvailableProducts,
  getProductsWithStock,
  getProductsDiscount,
};
