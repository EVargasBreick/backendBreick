const dbConnection = require("../server");
const { dateString } = require("../services/dateServices");

function registerOrder(data) {
  console.log("Pedido", data);
  var query = `insert into Pedidos 
    (
        idUsuarioCrea,
        idCliente,
        fechaCrea,
        fechaActualizacion,
        estado,
        montoFacturar,
        montoTotal,
        tipo,
        descuento,
        notas
    ) values (
        ${data.pedido.idUsuarioCrea},
        ${data.pedido.idCliente},
        '${data.pedido.fechaCrea}',
        '${data.pedido.fechaActualizacion}',
        '${data.pedido.estado}',
        '${data.pedido.montoFacturar}',
        '${data.pedido.montoTotal}',
        '${data.pedido.tipo}',
        '${data.pedido.descuento}',
        '${data.pedido.notas}'
    )`;
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      const newOrder = await dbConnection.executeQuery(query);
      if (newOrder.success) {
        const idCreado = await dbConnection.executeQuery(
          `select IDENT_CURRENT('dbo.Pedidos') as 'idCreado'`
        );
        console.log("Id Creado:", idCreado.data[0][0].idCreado);
        data.productos.map((producto) => {
          var queryProds = `insert into Pedido_Producto 
            (
                idPedido, 
                idProducto, 
                cantidadProducto, 
                totalProd
            ) values (
                ${idCreado.data[0][0].idCreado},
                ${producto.idProducto},
                '${producto.cantProducto}',
                ${producto.totalProd}
            )`;
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
                `delete from Pedidos where idPedido=${idCreado.data[0][0].idCreado}`
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
function getOrderStatus() {
  var queryStatus = `select count(estado) as conteo, estado from Pedidos GROUP by estado`;
  var responseObject = {};
  return new Promise((resolve) => {
    setTimeout(async () => {
      const statusList = await dbConnection.executeQuery(queryStatus);
      console.log("estados:", statusList.data);
      responseObject.code = 201;
      responseObject.data = statusList.data;
      resolve(JSON.stringify(responseObject));
    }, 1000);
  });
}

function getOrderList(params) {
  if (params.id === "") {
    var queryList = `select a.idPedido, substring(b.nombre,1,1) + '' +b.apPaterno+'-'+tipo+'00'+cast(a.idPedido as varchar) as codigoPedido 
    from Pedidos a inner join Usuarios b on a.idUsuarioCrea=b.idUsuario where a.estado=0`;
  } else {
    var queryList = `select a.idPedido, substring(b.nombre,1,1) + '' +b.apPaterno+'-'+tipo+'00'+cast(a.idPedido as varchar) as codigoPedido 
    from Pedidos a inner join Usuarios b on a.idUsuarioCrea=b.idUsuario where a.estado=0 and idPedido=${params.id}`;
  }

  return new Promise((resolve) => {
    setTimeout(async () => {
      const orderList = await dbConnection.executeQuery(queryList);
      resolve(
        JSON.stringify({
          code: 200,
          data: orderList.data,
        })
      );
    }, 1000);
  });
}

function approveOrder(params) {
  var queryUpdate = `update Pedidos set estado=1 where idPedido=${params.id}`;
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      const approved = await dbConnection.executeQuery(queryUpdate);
      resolve(
        JSON.stringify({
          code: 200,
          data: approved.data,
        })
      );
    }, 1000);
  });
}

function getOrderDetails(params) {
  var queryDet = `select top(1)g.nombre as nombreCliente, a.*, b.idProducto, b.cantidadProducto ,c.nombreProducto, 
    d.nombre+' '+d.apPaterno as nombreVendedor,
    e.razonSocial,
    substring(d.nombre,1,1) + '' +d.apPaterno+'-'+a.tipo+'00'+cast(a.idPedido as varchar) as codigoPedido,
    f.zona
    from Pedidos a inner join Pedido_Producto b on a.idPedido = b.idPedido
    inner join Productos c on b.idProducto=c.idProducto 
    inner join Usuarios d on d.idUsuario=a.idUsuarioCrea
    inner join Clientes e on e.idCliente=a.idCliente
    inner join Zonas f on f.idZona=e.idZona
    inner join Contactos_Cliente g on g.idCliente=e.idCliente
    where a.idPedido=${params.id}`;
  return new Promise((resolve) => {
    setTimeout(async () => {
      const orderDetail = await dbConnection.executeQuery(queryDet);
      resolve(
        JSON.stringify({
          code: 200,
          data: orderDetail.data,
        })
      );
    }, 1000);
  });
}

function getOrderType() {
  var queryType = `select count(tipo) as cant, tipo  from Pedidos GROUP by tipo`;
  return new Promise((resolve) => {
    setTimeout(async () => {
      const orderType = await dbConnection.executeQuery(queryType);
      resolve(
        JSON.stringify({
          code: 200,
          data: orderType.data,
        })
      );
    }, 1000);
  });
}

function getOrderProductList(params) {
  var queryList = `select a.*, c.nombreProducto, c.precioDeFabrica, c.codInterno from Pedido_Producto a inner JOIN Pedidos b on a.idPedido=b.idPedido
    inner join Productos c on c.idProducto=a.idProducto
    where a.idPedido=${params.id}`;
  return new Promise((resolve) => {
    setTimeout(async () => {
      const prodList = await dbConnection.executeQuery(queryList);
      resolve(
        JSON.stringify({
          code: 200,
          data: prodList.data,
        })
      );
    }, 1000);
  });
}

function deleteOrder(id) {
  var queryDeleteOrder = `delete from Pedidos where idPedido=${id}`;
  var queryDeleteProd = `delete from Pedido_Producto where idPedido=${id} `;
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      const delOrder = await dbConnection.executeQuery(queryDeleteOrder);
      if (delOrder.success) {
        setTimeout(async () => {
          const delProds = await dbConnection.executeQuery(queryDeleteProd);
          resolve(JSON.stringify(delProds));
        }, 500);
      } else {
        reject(JSON.parse(delOrder));
      }
    }, 500);
  });
}

function cancelOrder(id) {
  var queryCancelOrder = `update Pedidos set estado=2 where idPedido=${id}`;
  return new Promise((resolve) => {
    setTimeout(async () => {
      const prodList = await dbConnection.executeQuery(queryCancelOrder);
      resolve(
        JSON.stringify({
          code: 200,
          data: prodList.data,
        })
      );
    }, 1000);
  });
}

function addProductOrder(body) {
  return new Promise((resolve) => {
    if (body.productos.length > 0) {
      body.productos.map((pr) => {
        setTimeout(async () => {
          var queryAdd = `insert into Pedido_Producto (idPedido, idProducto, cantidadProducto, totalProd) 
          values (${body.idPedido},${pr.idProducto},${pr.cantProducto},${pr.totalProd})`;
          const addedProduct = await dbConnection.executeQuery(queryAdd);
          if (addedProduct.success) {
            resolve(
              JSON.stringify({
                code: 200,
                data: addedProduct.data,
              })
            );
          }
        }, 200);
      });
    } else {
      setTimeout(() => {
        resolve(
          JSON.stringify({
            code: 200,
            data: "no product to add",
          })
        );
      }, 200);
    }
  });
}

function updateProductOrder(body) {
  return new Promise((resolve) => {
    if (body.productos.length > 0) {
      body.productos.map((pr) => {
        setTimeout(async () => {
          var queryAdd = `update Pedido_Producto 
        set idPedido=${body.idPedido}, idProducto=${pr.idProducto}, cantidadProducto=${pr.cantProducto}, totalProd=${pr.totalProd}
        where idPedidoProducto=${pr.idPedidoProducto}`;
          const addedProduct = await dbConnection.executeQuery(queryAdd);
          if (addedProduct.success) {
            resolve(
              JSON.stringify({
                code: 200,
                data: addedProduct.data,
              })
            );
          }
        }, 200);
      });
    } else {
      setTimeout(() => {
        resolve(
          JSON.stringify({
            code: 200,
            data: "no product to add",
          })
        );
      }, 200);
    }
  });
}

function updateOrder(body) {
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      var d = new Date(),
        dformat =
          [d.getMonth() + 1, d.getDate(), d.getFullYear()].join("/") +
          " " +
          [d.getHours(), d.getMinutes(), d.getSeconds()].join(":");
      var queryUpdate = `Update Pedidos set montoFacturar=${body.montoFacturar}, montoTotal=${body.montoTotal}, fechaActualizacion='${dformat}' where idPedido=${body.idPedido}`;
      const updatedOrder = await dbConnection.executeQuery(queryUpdate);
      if (updatedOrder.success) {
        resolve(
          JSON.stringify({
            code: 200,
            data: updatedOrder,
          })
        );
      } else {
        reject(
          JSON.stringify({
            code: 400,
            data: updatedOrder,
          })
        );
      }
    }, 200);
  });
}

module.exports = {
  registerOrder,
  getOrderStatus,
  getOrderList,
  getOrderDetails,
  getOrderType,
  approveOrder,
  getOrderProductList,
  deleteOrder,
  cancelOrder,
  updateProductOrder,
  addProductOrder,
  updateOrder,
};
