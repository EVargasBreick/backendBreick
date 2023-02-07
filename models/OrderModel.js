const dbConnection = require("../server");

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
        descuentoCalculado,
        notas,
        facturado,
        impreso,
        listo
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
        '${data.pedido.descCalculado}',
        '${data.pedido.notas}',
        0,
        0,
        0
    )`;
  console.log("Creacion pedido query", query);
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
                totalProd,
                descuentoProducto
            ) values (
                ${idCreado.data[0][0].idCreado},
                ${producto.idProducto},
                '${producto.cantProducto}',
                ${producto.totalProd},
                ${producto.descuentoProd}
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
    from Pedidos a inner join Usuarios b on a.idUsuarioCrea=b.idUsuario where a.estado=0 and a.listo=1`;
  } else {
    var queryList = `select a.idPedido, substring(b.nombre,1,1) + '' +b.apPaterno+'-'+tipo+'00'+cast(a.idPedido as varchar) as codigoPedido 
    from Pedidos a inner join Usuarios b on a.idUsuarioCrea=b.idUsuario where a.estado=0 and idPedido=${params.id} and a.listo=1`;
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

function getUserOrderList(params) {
  if (params.id === "") {
    var queryList = `select a.idPedido, substring(b.nombre,1,1) + '' +b.apPaterno+'-'+tipo+'00'+cast(a.idPedido as varchar) as codigoPedido 
    from Pedidos a inner join Usuarios b on a.idUsuarioCrea=b.idUsuario ${params.condition}`;
  } else {
    var queryList = `select a.idPedido, substring(b.nombre,1,1) + '' +b.apPaterno+'-'+tipo+'00'+cast(a.idPedido as varchar) as codigoPedido 
    from Pedidos a inner join Usuarios b on a.idUsuarioCrea=b.idUsuario where b.idUsuario=${params.id} ${params.condition}`;
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
  var d = new Date(),
    dformat =
      [d.getMonth() + 1, d.getDate(), d.getFullYear()].join("/") +
      " " +
      [d.getHours(), d.getMinutes(), d.getSeconds()].join(":");
  var queryUpdate = `update Pedidos set estado=1, fechaActualizacion='${dformat}' where idPedido=${params.id}`;
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
  var queryDet = `select a.*, b.idProducto, b.cantidadProducto ,c.nombreProducto, 
  d.nombre+' '+d.apPaterno as nombreVendedor, e.nit, b.descuentoProducto,
  e.razonSocial,
  substring(d.nombre,1,1) + '' +d.apPaterno+'-'+a.tipo+'00'+cast(a.idPedido as varchar) as codigoPedido,
  f.zona
  from Pedidos a inner join Pedido_Producto b on a.idPedido = b.idPedido
  inner join Productos c on b.idProducto=c.idProducto 
  inner join Usuarios d on d.idUsuario=a.idUsuarioCrea
  inner join Clientes e on e.idCliente=a.idCliente
  inner join Zonas f on f.idZona=e.idZona
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
  var queryList = `select a.*, c.nombreProducto, c.precioDeFabrica, c.codInterno, c.tipoProducto, c.codigoBarras, c.precioDescuentoFijo from Pedido_Producto a inner JOIN Pedidos b on a.idPedido=b.idPedido
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
  var d = new Date(),
    dformat =
      [d.getMonth() + 1, d.getDate(), d.getFullYear()].join("/") +
      " " +
      [d.getHours(), d.getMinutes(), d.getSeconds()].join(":");
  console.log("Pedido a cancelar desde el back", id);
  var queryCancelOrder = `update Pedidos set estado=2, fechaActualizacion='${dformat}' where idPedido=${id}`;
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
          var queryAdd = `insert into Pedido_Producto (idPedido, idProducto, cantidadProducto, totalProd, descuentoProducto) 
          values (${body.idPedido},${pr.idProducto},${pr.cantProducto},${pr.totalProd},${pr.descuentoProd})`;
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

function deleteProductOrder(body) {
  console.log("Borrando producto....", body);
  return new Promise((resolve) => {
    if (body.productos.length > 0) {
      body.productos.map((pr) => {
        setTimeout(async () => {
          var queryDelete = `delete from Pedido_Producto where idPedidoProducto=${pr.idPedidoProducto}`;
          const deleted = await dbConnection.executeQuery(queryDelete);
          if (deleted.success) {
            resolve(
              JSON.stringify({
                code: 200,
                data: deleted.data,
              })
            );
          }
        }, 100);
      });
    } else {
      setTimeout(() => {
        resolve(
          JSON.stringify({
            code: 200,
            data: "no product to add",
          })
        );
      }, 100);
    }
  });
}

function updateProductOrder(body) {
  return new Promise((resolve) => {
    if (body.productos.length > 0) {
      body.productos.map((pr) => {
        setTimeout(async () => {
          var queryAdd = `update Pedido_Producto 
        set idPedido=${body.idPedido}, idProducto=${pr.idProducto}, cantidadProducto=${pr.cantProducto}, totalProd=${pr.totalProd}, descuentoProducto=${pr.descuentoProd}
        where idPedidoProducto=${pr.idPedidoProducto}`;
          console.log("Query para testear error", queryAdd);
          const addedProduct = await dbConnection.executeQuery(queryAdd);
          if (addedProduct.success) {
            console.log("Acaaa?", addedProduct);
            resolve(
              JSON.stringify({
                code: 200,
                data: addedProduct.data,
              })
            );
          } else {
            console.log("Error", addedProduct);
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
      var queryUpdate = `Update Pedidos set montoFacturar=${body.montoFacturar}, montoTotal=${body.montoTotal}, fechaActualizacion='${dformat}', descuento=${body.descuento}, descuentoCalculado=${body.descCalculado}, listo=${body.listo}, impreso=${body.impreso} where idPedido=${body.idPedido}`;
      console.log("Query ACTUALIZAR", queryUpdate);
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

function getOrdersToInvoice() {
  return new Promise((resolve, reject) => {
    const query = `select pd.*, cl.razonSocial, cl.nit,SUBSTRING(nombre, 1, 1)+''+apPaterno+'-'+tipo+'00'+cast(pd.idPedido as varchar) as idString from Pedidos pd 
    inner join Clientes cl on pd.idCliente=cl.idCliente 
    inner join Usuarios us on pd.idUsuarioCrea=us.idUsuario
    where  pd.estado=1 and pd.facturado=0 and pd.listo=1 and pd.tipo='normal'`;
    setTimeout(async () => {
      const orderList = await dbConnection.executeQuery(query);
      if (orderList.success) {
        resolve(
          JSON.stringify({
            code: 200,
            data: orderList,
          })
        );
      } else {
        reject(
          JSON.stringify({
            code: 400,
            data: orderList,
          })
        );
      }
    }, 100);
  });
}

function getOrderToInvoiceDetails(params) {
  return new Promise((resolve, reject) => {
    const query = `select pd.*, pp.*, cl.nit, cl.razonSocial, us.idAlmacen, pr.nombreProducto, pr.codInterno, pr.codigoUnidad, pr.precioDeFabrica from Pedidos pd 
    inner join Pedido_Producto pp on pd.idPedido=pp.idPedido
    inner join Clientes cl on pd.idCliente=cl.idCliente
    inner join Usuarios us on pd.idUsuarioCrea=us.idUsuario
    inner join Productos pr on pr.idProducto=pp.idProducto
    where pd.idPedido=${params.id}`;
    setTimeout(async () => {
      const orderDetails = await dbConnection.executeQuery(query);
      if (orderDetails.success) {
        resolve(
          JSON.stringify({
            code: 200,
            response: orderDetails,
          })
        );
      } else {
        reject(
          JSON.stringify({
            code: 400,
            response: orderDetails,
          })
        );
      }
    }, 100);
  });
}

function invoiceOrder(params) {
  return new Promise((resolve, reject) => {
    const query = `update Pedidos set facturado=1, fechaActualizacion='${params.fechaHora}' where idPedido=${params.idPedido}`;
    setTimeout(async () => {
      const orderDetails = await dbConnection.executeQuery(query);
      if (orderDetails.success) {
        console.log("Query no fallo", query);
        resolve(
          JSON.stringify({
            code: 200,
            response: orderDetails,
          })
        );
      } else {
        console.log("Query fallo", query);
        reject(
          JSON.stringify({
            code: 400,
            response: orderDetails,
          })
        );
      }
    }, 100);
  });
}
function numberOfInvoiced() {
  return new Promise((resolve, reject) => {
    const query = `select count(*) as SinFacturar, (select count(*) from Pedidos where facturado=1) as Facturados from Pedidos where facturado=0`;
    setTimeout(async () => {
      const conteo = await dbConnection.executeQuery(query);
      if (conteo.success) {
        resolve(
          JSON.stringify({
            code: 200,
            response: conteo,
          })
        );
      } else {
        reject(
          JSON.stringify({
            code: 400,
            response: conteo,
          })
        );
      }
    }, 100);
  });
}

function getNotPrinted() {
  const query = `select pd.idPedido as idOrden, concat(upper(pd.tipo),'0',cast(pd.idPedido as varchar)) as nroOrden, us.usuario, pd.fechaCrea, 
  pr.codInterno, pr.nombreProducto, pp.cantidadProducto, 'P' as tipo
  from Pedidos pd
  inner join Usuarios us on pd.idUsuarioCrea=us.idUsuario 
  inner join Pedido_Producto pp on pp.idPedido=pd.idPedido
  inner join Productos pr on pr.idProducto=pp.idProducto
  where pd.impreso=0 and pd.listo=0 and pd.estado=0
  union
  select tp.idTraspaso as idOrden, tp.nroOrden, us.usuario, tp.fechaCrea, pr.codInterno, pr.nombreProducto, tpr.cantidadProducto, 'T' as tipo
  from Traspasos tp 
  inner join Usuarios us on us.idUsuario=tp.idUsuario
  inner join Traspaso_producto tpr on tpr.idTraspaso=tp.idTraspaso
  inner join Productos pr on tpr.idProducto=pr.idProducto
  where tp.movil=1 and tp.listo=0 and tp.impreso=0
  union 
  select tp.idTraspaso as idOrden, tp.nroOrden, us.usuario, tp.fechaCrea, pr.codInterno, pr.nombreProducto, tpr.cantidadProducto, 'T' as tipo
  from Traspasos tp 
  inner join Usuarios us on us.idUsuario=tp.idUsuario
  inner join Traspaso_producto tpr on tpr.idTraspaso=tp.idTraspaso
  inner join Productos pr on tpr.idProducto=pr.idProducto
  where tp.movil=0 and tp.listo=0 and tp.impreso=0 and tp.estado=1 and tp.idOrigen='AL001'
  `;
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      const notPrinted = await dbConnection.executeQuery(query);
      if (notPrinted) {
        resolve(notPrinted);
      } else {
        reject(notPrinted);
      }
    }, 100);
  });
}

function orderPrinted(params) {
  const query = `update Pedidos set impreso=1 where idPedido=${params.id}`;
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      const printed = await dbConnection.executeQuery(query);
      if (printed.success) {
        resolve(printed);
      } else {
        reject(printed);
      }
    }, 100);
  });
}

function orderToReady() {
  const query = `
  select pd.idPedido as idOrden, concat(upper(pd.tipo),'0',cast(pd.idPedido as varchar)) as nroOrden, pd.fechaCrea,'P' as tipo, us.usuario
  from Pedidos pd inner join Usuarios us on us.idUsuario=pd.idUsuarioCrea where pd.impreso=1 and pd.listo=0
  union
  select tp.idTraspaso as idOrden, tp.nroOrden, tp.fechaCrea, 'T' as tipo, us.usuario
  from Traspasos tp inner join Usuarios us on us.idUsuario=tp.idUsuario where tp.impreso=1 and tp.listo=0`;
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      const printed = await dbConnection.executeQuery(query);
      if (printed.success) {
        resolve(printed);
      } else {
        reject(printed);
      }
    }, 100);
  });
}

function toRePrintDetails(params) {
  const query = `select pd.idPedido, pd.fechaCrea,concat(upper(pd.tipo),'0',cast(pd.idPedido as varchar)) as nroOrden, us.usuario, pr.codInterno, pr.nombreProducto ,tp.cantidadProducto from Pedidos pd
  inner join Pedido_Producto tp on pd.idPedido=tp.idPedido
  inner join Productos pr on pr.idProducto=tp.idProducto 
  inner join Usuarios us on us.idUsuario=pd.idUsuarioCrea
  where pd.idPedido=${params.id}`;
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      const printed = await dbConnection.executeQuery(query);
      if (printed.success) {
        resolve(printed);
      } else {
        reject(printed);
      }
    }, 100);
  });
}

function changeReady(params) {
  const query = `update Pedidos set listo=${params.listo} where idPedido=${params.id}`;
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      const changed = await dbConnection.executeQuery(query);
      if (changed.success) {
        resolve(changed);
      } else {
        reject(changed);
      }
    }, 100);
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
  deleteProductOrder,
  getUserOrderList,
  getOrdersToInvoice,
  getOrderToInvoiceDetails,
  invoiceOrder,
  numberOfInvoiced,
  getNotPrinted,
  orderPrinted,
  orderToReady,
  toRePrintDetails,
  changeReady,
};
