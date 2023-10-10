const { client } = require("../postgressConn");
const dbConnection = require("../server");

function registerSale(data) {
  console.log("Ventas", data);
  var query = `insert into Ventas 
      (
          idUsuarioCrea,
          idCliente,
          fechaCrea,
          fechaActualizacion,
          montoTotal,
          descuentoCalculado,
          descuento,
          montoFacturar,
          idPedido,
          idFactura
      ) values (
          ${data.pedido.idUsuarioCrea},
          ${data.pedido.idCliente},
          '${data.pedido.fechaCrea}',
          '${data.pedido.fechaActualizacion}',
          '${data.pedido.montoTotal}',
          '${data.pedido.descCalculado}',
          '${data.pedido.descuento}',
          '${data.pedido.montoFacturar}',
          '${data.pedido.idPedido}',
          '${data.pedido.idFactura}'
      )`;
  console.log("Creacion pedido query", query);
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      const newOrder = await dbConnection.executeQuery(query);
      if (newOrder.success) {
        const idCreado = await dbConnection.executeQuery(
          `select IDENT_CURRENT('dbo.Ventas') as 'idCreado'`
        );
        console.log("Id Creado:", idCreado.data[0][0].idCreado);
        console.log("Productos", data.productos);
        data.productos.map((producto) => {
          var queryProds = `insert into Venta_Productos
              (
                  idVenta, 
                  idProducto, 
                  cantidadProducto, 
                  totalProd,
                  descuentoProducto
              ) values (
                  ${idCreado.data[0][0].idCreado},
                  ${producto.idProducto},
                  '${producto.cantProducto}',
                  ${producto.total},
                  ${producto.descuentoProd}
              )`;
          console.log("QUERY", queryProds);
          setTimeout(async () => {
            const prods = await dbConnection.executeQuery(queryProds);
            if (prods.success) {
              resolve(
                JSON.stringify({
                  code: 201,
                  data: {
                    idCreado: idCreado.data[0][0].idCreado,
                  },
                })
              );
            } else {
              const del = dbConnection.executeQuery(
                `delete from Ventas where idVenta=${idCreado.data[0][0].idCreado}`
              );
              del.then(() => {
                resolve(
                  JSON.stringify({
                    code: 400,
                    data: "Error",
                    message: "Products: " + prods.message,
                  })
                );
              }).catch((err) => {
                throw err;
              });;
            }
          }, 1000);
        });
      } else {
        resolve(
          JSON.stringify({
            code: 400,
            data: "Error",
            message: "Pedido: " + newOrder.message,
          })
        );
      }
    }, 1000);
  });
}

function registerSalePos(data, idFactura) {
  console.log("Ventas", data, idFactura);
  const idPedido = data.pedido.idPedido != "" ? data.pedido.idPedido : 0;
  var query = `insert into Ventas 
      (
          "idUsuarioCrea",
          "idCliente",
          "fechaCrea",
          "fechaActualizacion",
          "montoTotal",
          "descuentoCalculado",
          descuento,
          "montoFacturar",
          "idPedido",
          "idFactura"
      ) values (
          ${data.pedido.idUsuarioCrea},
          ${data.pedido.idCliente},
          '${data.pedido.fechaCrea}',
          '${data.pedido.fechaActualizacion}',
          '${data.pedido.montoTotal}',
          '${data.pedido.descCalculado}',
          '${data.pedido.descuento}',
          '${data.pedido.montoFacturar}',
          '${idPedido}',
          '${idFactura ? idFactura : data.pedido.idFactura}'
      ) returning "idVenta"`;
  console.log("Creacion pedido query", query);
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      try {
        const newOrder = await client.query(query);
        const idCreado = newOrder.rows[0].idVenta;
        data.productos.map((producto) => {
          const totalProducto =
            producto.total != undefined ? producto.total : producto.totalProd;
          var queryProds = `insert into Venta_Productos
              (
                 "idVenta", 
                  "idProducto", 
                  "cantidadProducto", 
                  "totalProd",
                  "descuentoProducto"
              ) values (
                  ${idCreado},
                  ${producto.idProducto},
                  '${producto.cantProducto}',
                  ${totalProducto},
                  ${producto.descuentoProd}
              )`;
          console.log("Insertando productos", queryProds);
          setTimeout(async () => {
            try {
              const prods = await client.query(queryProds);
              resolve(
                JSON.stringify({
                  code: 201,
                  idCreado: idCreado,
                  data: {
                    idCreado: idCreado,
                  },
                })
              );
            } catch (err) {
              const del = client.query(
                `delete from Ventas where "idVenta"=${idCreado}`
              );
              del.then(() => {
                resolve(
                  JSON.stringify({
                    code: 400,
                    data: "Error",
                    message: "Products: " + err,
                  })
                );
              }).catch((err) => {
                throw err;
              });;
            }
          }, 1000);
        });
      } catch (err) {
        resolve(
          JSON.stringify({
            code: 400,
            data: "Error",
            message: "Pedido: " + err,
          })
        );
      }
    }, 1000);
  });
}

function deleteSale(params) {
  const query = `delete from Ventas where "idVenta"=${params.id}`;
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      try {
        const leng = await client.query(query);
        const queryProds = `delete from Venta_Productos where "idVenta"=${params.id}`;
        const deled = await client.query(queryProds);
        resolve({
          leng: leng.rows,
          deled: deled.rows,
        });
      } catch (err) {
        reject(err);
      }
    }, 100);
  });
}

module.exports = { registerSale, registerSalePos, deleteSale };
