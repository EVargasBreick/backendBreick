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
              });
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

module.exports = { registerSale };
