const { client } = require("../postgressConn");
const dbConnection = require("../server");

function registerOrder(data) {
  console.log("Pedido", data);
  const imp = data.impreso != undefined ? data.impreso : 0;
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
        ${imp},
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

//CONECTANDOSE A LA BASE DE DATOS DE POSTGRESS

function registerOrderPos(data) {
  const imp = data.pedido.impreso != undefined ? data.pedido.impreso : 0;
  console.log("Notas", data.pedido.notas);
  var query = `insert into Pedidos 
    (
        "idUsuarioCrea",
        "idCliente",
        "fechaCrea",
        "fechaActualizacion",
        estado,
        "montoFacturar",
        "montoTotal",
        tipo,
        descuento,
        "descuentoCalculado",
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
        ${imp},
        0
    ) returning "idPedido"`;
  console.log("Creacion pedido query", query);
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      try {
        const newOrder = await client.query(query);
        const idCreado = newOrder.rows[0].idPedido;
        data.productos.map((producto) => {
          var queryProds = `insert into Pedido_Producto 
            (
                "idPedido", 
                "idProducto", 
                "cantidadProducto", 
                "totalProd",
                "descuentoProducto"
            ) values (
                ${idCreado},
                ${producto.idProducto},
                '${producto.cantProducto}',
                ${producto.totalProd},
                ${producto.descuentoProd}
            )`;
          setTimeout(async () => {
            try {
              const prods = await client.query(queryProds);
              resolve(
                JSON.stringify({
                  code: 201,
                  data: {
                    idCreado: idCreado,
                  },
                })
              );
            } catch (error) {
              try {
                const del = client.query(
                  `delete from Pedidos where "idPedido"=${idCreado}`
                );
                del.then(() => {
                  resolve(
                    JSON.stringify({
                      code: 400,
                      data: "Error al aumentar los productos",
                      message: "Products: " + error,
                    })
                  );
                });
              } catch (err) {}
            }
          }, 100);
        });
        ujm;
      } catch (err) {
        resolve(
          JSON.stringify({
            code: 400,
            data: "Error al aumentar los pedidos",
            message: "Pedido: " + err,
          })
        );
      }
    }, 100);
  });
}

function getOrderStatusPos() {
  var queryStatus = `select count(estado) as conteo, estado from Pedidos GROUP by estado`;
  var responseObject = {};
  return new Promise((resolve) => {
    setTimeout(async () => {
      try {
        const statusList = await client.query(queryStatus);
        responseObject.code = 201;
        responseObject.data = statusList.rows;
        resolve(JSON.stringify(responseObject));
      } catch (err) {}
    }, 100);
  });
}

function getOrderListPos(params) {
  if (params.id === "") {
    var queryList = `select a."idPedido", substring(b.nombre,1,1) || '' ||b."apPaterno"||'-'||tipo||'00'||cast(a."idPedido" as varchar) as "codigoPedido" 
    from Pedidos a inner join Usuarios b on a."idUsuarioCrea"=b."idUsuario" where a.estado='0' and a.listo=0 and impreso=0`;
  } else {
    var queryList = `select a."idPedido", substring(b.nombre,1,1) || '' ||b."apPaterno"||'-'||tipo||'00'||cast(a."idPedido" as varchar) as "codigoPedido"
    from Pedidos a inner join Usuarios b on a."idUsuarioCrea"=b."idUsuario" where a.estado='0' and "idPedido"=${params.id} and a.listo=0 and impreso=0`;
  }
  return new Promise((resolve) => {
    setTimeout(async () => {
      try {
        const orderList = await client.query(queryList);
        resolve(
          JSON.stringify({
            code: 200,
            data: orderList.rows,
          })
        );
      } catch (err) {
        console.log("Error", err);
      }
    }, 100);
  });
}

function getAlltOrderListPos(params) {
  if (params.id === "") {
    var queryList = `select a."idPedido", substring(b.nombre,1,1) || '' ||b."apPaterno"||'-'||tipo||'00'||cast(a."idPedido" as varchar) as "codigoPedido", b."idUsuario"
    from Pedidos a inner join Usuarios b on a."idUsuarioCrea"=b."idUsuario"`;
  } else {
    var queryList = `select a."idPedido", substring(b.nombre,1,1) || '' ||b."apPaterno"||'-'||tipo||'00'||cast(a."idPedido" as varchar) as "codigoPedido", b."idUsuario"
    from Pedidos a inner join Usuarios b on a."idUsuarioCrea"=b."idUsuario" and "idPedido"=${params.id}`;
  }
  return new Promise((resolve) => {
    setTimeout(async () => {
      try {
        const orderList = await client.query(queryList);
        resolve(
          JSON.stringify({
            code: 200,
            data: orderList.rows,
          })
        );
      } catch (err) {
        console.log("Error", err);
      }
    }, 100);
  });
}

function getUserOrderListPos(params) {
  if (params.id === "") {
    var queryList = `select a."idPedido", substring(b.nombre,1,1) || '' || b."apPaterno"||'-'||tipo||'00'||cast(a."idPedido" as varchar) as "codigoPedido", b."idAlmacen"
    from Pedidos a inner join Usuarios b on a."idUsuarioCrea"=b."idUsuario" ${params.condition}`;
  } else {
    var queryList = `select a."idPedido", substring(b.nombre,1,1) || '' || b."apPaterno"||'-'||tipo||'00'||cast(a."idPedido" as varchar) as "codigoPedido" , b."idAlmacen"
    from Pedidos a inner join Usuarios b on a."idUsuarioCrea"=b."idUsuario" where b."idUsuario"=${params.id} ${params.condition}`;
  }
  console.log("Query de lista para editar", queryList);
  return new Promise((resolve) => {
    setTimeout(async () => {
      try {
        const orderList = await client.query(queryList);
        resolve(
          JSON.stringify({
            code: 200,
            data: orderList.rows,
          })
        );
      } catch (err) {}
    }, 100);
  });
}

function approveOrderPos(params) {
  var d = new Date(),
    dformat =
      [d.getMonth() + 1, d.getDate(), d.getFullYear()].join("/") +
      " " +
      [d.getHours(), d.getMinutes(), d.getSeconds()].join(":");
  var queryUpdate = `update Pedidos set estado=1, "fechaActualizacion"='${dformat}' where "idPedido"=${params.id}`;
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      try {
        const approved = await client.query(queryUpdate);
        resolve(
          JSON.stringify({
            code: 200,
            data: approved.rows,
          })
        );
      } catch (err) {
        console.log("Error", err);
      }
    }, 100);
  });
}

function getOrderDetailsPos(params) {
  var queryDet = `select a.*, b."idProducto", b."cantidadProducto" ,c."nombreProducto", 
  d.nombre||' '||d."apPaterno" as "nombreVendedor", e.nit, b."descuentoProducto", d.usuario,
  e."razonSocial", d."idAlmacen",
  substring(d.nombre,1,1) || '' ||d."apPaterno"||'-'||a.tipo||'00'||cast(a."idPedido" as varchar) as "codigoPedido",
  f.zona, d.rol, e."idZona"
  from Pedidos a inner join Pedido_Producto b on a."idPedido" = b."idPedido"
  inner join Productos c on b."idProducto"=c."idProducto" 
  inner join Usuarios d on d."idUsuario"=a."idUsuarioCrea"
  inner join Clientes e on e."idCliente"=a."idCliente"
  inner join Zonas f on f."idZona"=e."idZona"
 where a."idPedido"=${params.id}`;
  return new Promise((resolve) => {
    setTimeout(async () => {
      const orderDetail = await client.query(queryDet);
      resolve(
        JSON.stringify({
          code: 200,
          data: orderDetail.rows,
        })
      );
    }, 1000);
  });
}

function getOrderTypePos() {
  var queryType = `select count(tipo) as cant, tipo  from Pedidos GROUP by tipo`;
  return new Promise((resolve) => {
    setTimeout(async () => {
      try {
        const orderType = await client.query(queryType);
        resolve(
          JSON.stringify({
            code: 200,
            data: orderType.rows,
          })
        );
      } catch (err) {}
    }, 100);
  });
}

function getOrderProductListPos(params) {
  var queryList = `select a.*, c."nombreProducto", c."precioDeFabrica", c."codInterno", c."tipoProducto", c."codigoBarras", c."precioDescuentoFijo", a."cantidadProducto" as "cantProducto" from Pedido_Producto a inner JOIN Pedidos b on a."idPedido"=b."idPedido"
    inner join Productos c on c."idProducto"=a."idProducto"
    where a."idPedido"=${params.id}`;
  return new Promise((resolve) => {
    setTimeout(async () => {
      try {
        const prodList = await client.query(queryList);
        resolve(
          JSON.stringify({
            code: 200,
            data: prodList.rows,
          })
        );
      } catch (err) {}
    }, 100);
  });
}

function deleteOrderPos(params) {
  var queryDeleteOrder = `delete from Pedidos where "idPedido"=${params.id}`;

  var queryDeleteProd = `delete from Pedido_Producto where "idPedido"=${params.id} `;
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      try {
        const delOrder = await client.query(queryDeleteOrder);
        resolve(delOrder);
      } catch (err) {
        console.log("Error al borrar", err);
        reject(err);
      }
    }, 500);
  });
}

function cancelOrderPos(id) {
  var d = new Date(),
    dformat =
      [d.getMonth() + 1, d.getDate(), d.getFullYear()].join("/") +
      " " +
      [d.getHours(), d.getMinutes(), d.getSeconds()].join(":");
  var queryCancelOrder = `update Pedidos set estado=2, "fechaActualizacion"='${dformat}' where "idPedido"=${id}`;
  return new Promise((resolve) => {
    setTimeout(async () => {
      try {
        const prodList = await client.query(queryCancelOrder);
        resolve(
          JSON.stringify({
            code: 200,
            data: prodList.rows,
          })
        );
      } catch (err) {}
    }, 100);
  });
}

function addProductOrderPos(body) {
  return new Promise((resolve) => {
    if (body.productos.length > 0) {
      body.productos.map((pr) => {
        setTimeout(async () => {
          var queryAdd = `insert into Pedido_Producto ("idPedido", "idProducto", "cantidadProducto", "totalProd", "descuentoProducto") 
          values (${body.idPedido},${pr.idProducto},${pr.cantProducto},${pr.totalProd},${pr.descuentoProd})`;
          try {
            const addedProduct = await client.query(queryAdd);
            resolve(
              JSON.stringify({
                code: 200,
                data: addedProduct.rows,
              })
            );
          } catch (err) {}
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

function deleteProductOrderPos(body) {
  console.log("Borrando producto....", body);
  return new Promise((resolve) => {
    if (body.productos.length > 0) {
      body.productos.map((pr) => {
        setTimeout(async () => {
          var queryDelete = `delete from Pedido_Producto where "idPedidoProducto"=${pr.idPedidoProducto}`;
          try {
            const deleted = await client.query(queryDelete);
            resolve(
              JSON.stringify({
                code: 200,
                data: deleted.rows,
              })
            );
          } catch {}
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

function updateProductOrderPos(body) {
  return new Promise((resolve) => {
    if (body.productos.length > 0) {
      body.productos.map((pr) => {
        setTimeout(async () => {
          var queryAdd = `update Pedido_Producto 
        set "idPedido"=${body.idPedido}, "idProducto"=${pr.idProducto}, "cantidadProducto"=${pr.cantProducto}, "totalProd"=${pr.totalProd}, "descuentoProducto"=${pr.descuentoProd}
        where "idPedidoProducto"=${pr.idPedidoProducto}`;
          console.log("Query para testear error", queryAdd);
          try {
            const addedProduct = await client.query(queryAdd);
            resolve(
              JSON.stringify({
                code: 200,
                data: addedProduct.rows,
              })
            );
          } catch (err) {
            console.log("Error", err);
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

function updateOrderPos(body) {
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      var d = new Date(),
        dformat =
          [d.getMonth() + 1, d.getDate(), d.getFullYear()].join("/") +
          " " +
          [d.getHours(), d.getMinutes(), d.getSeconds()].join(":");
      var queryUpdate = `Update Pedidos set "montoFacturar"=${body.montoFacturar}, "montoTotal"=${body.montoTotal}, "fechaActualizacion"='${dformat}', descuento=${body.descuento}, "descuentoCalculado"=${body.descCalculado}, listo=${body.listo}, impreso=${body.impreso}, estado=${body.estado} where "idPedido"=${body.idPedido}`;
      console.log("Actualizando pedido", queryUpdate);
      try {
        const updatedOrder = await client.query(queryUpdate);

        resolve(
          JSON.stringify({
            code: 200,
            data: updatedOrder.rows,
          })
        );
      } catch (err) {
        reject(
          JSON.stringify({
            code: 400,
            data: err,
          })
        );
      }
    }, 200);
  });
}

function getOrdersToInvoicePos(params) {
  console.log("Params", params);
  const isInterior = params.idDepto != "" ? true : false;
  console.log("Is store?", isInterior);
  return new Promise((resolve, reject) => {
    var query;
    if (!isInterior) {
      query = `select pd.*, cl."razonSocial", us.usuario, cl.nit,SUBSTRING(nombre, 1, 1)||''||"apPaterno"||'-'||tipo||'00'||cast(pd."idPedido" as varchar) as "idString" from Pedidos pd 
      inner join Clientes cl on pd."idCliente"=cl."idCliente" 
      inner join Usuarios us on pd."idUsuarioCrea"=us."idUsuario"
      where  pd.estado='1' and pd.facturado=0 and pd.listo=1 and pd.tipo='normal'`;
    } else {
      query = `select pd.*, cl."razonSocial", us.usuario, cl.nit,SUBSTRING(nombre, 1, 1)||''||"apPaterno"||'-'||tipo||'00'||cast(pd."idPedido" as varchar) as "idString" from Pedidos pd 
      inner join Clientes cl on pd."idCliente"=cl."idCliente" 
      inner join Usuarios us on pd."idUsuarioCrea"=us."idUsuario" 
      where us."idDepto"=${params.idDepto} and pd.estado='1' and pd.facturado=0 and pd.listo=1 and pd.tipo='normal'`;
    }
    setTimeout(async () => {
      try {
        console.log("Query siendo usado", query);
        const orderList = await client.query(query);
        resolve(
          JSON.stringify({
            code: 200,
            data: orderList.rows,
          })
        );
      } catch (err) {
        reject(
          JSON.stringify({
            code: 400,
            data: err,
          })
        );
      }
    }, 100);
  });
}

function getOrderToInvoiceDetailsPos(params) {
  return new Promise((resolve, reject) => {
    const query = `select pd.*, pp.*, cl.nit, cl."razonSocial", cl."tipoDocumento", cl.correo, us."idAlmacen", pr."nombreProducto", pr."codInterno", pr."codigoUnidad", pr."precioDeFabrica" from Pedidos pd 
    inner join Pedido_Producto pp on pd."idPedido"=pp."idPedido"
    inner join Clientes cl on pd."idCliente"=cl."idCliente"
    inner join Usuarios us on pd."idUsuarioCrea"=us."idUsuario"
    inner join Productos pr on pr."idProducto"=pp."idProducto"
    where pd."idPedido"=${params.id}`;
    setTimeout(async () => {
      try {
        const orderDetails = await client.query(query);
        resolve(
          JSON.stringify({
            code: 200,
            response: orderDetails.rows,
          })
        );
      } catch (err) {
        reject(
          JSON.stringify({
            code: 400,
            response: err,
          })
        );
      }
    }, 100);
  });
}

function invoiceOrderPos(params) {
  return new Promise((resolve, reject) => {
    const query = `update Pedidos set facturado=1, "fechaActualizacion"='${params.fechaHora}' where "idPedido"=${params.idPedido}`;
    setTimeout(async () => {
      try {
        const orderDetails = await client.query(query);
        resolve(
          JSON.stringify({
            code: 200,
            response: orderDetails.rows,
          })
        );
      } catch (err) {
        reject(
          JSON.stringify({
            code: 400,
            response: err,
          })
        );
      }
    }, 100);
  });
}

function numberOfInvoicedPos() {
  return new Promise((resolve, reject) => {
    const query = `select count(*) as" SinFacturar", (select count(*) from Pedidos where facturado=1) as" Facturados" from Pedidos where facturado=0`;
    setTimeout(async () => {
      try {
        const conteo = await client.query(query);
        resolve(
          JSON.stringify({
            code: 200,
            response: conteo.rows,
          })
        );
      } catch (err) {
        reject(
          JSON.stringify({
            code: 400,
            response: err,
          })
        );
      }
    }, 100);
  });
}

function getNotPrintedPos() {
  const query = `select pd."idPedido" as "idOrden", concat(upper(pd.tipo),'0',cast(pd."idPedido" as varchar)) as "nroOrden", us."usuario", pd."fechaCrea", 
  pr."codInterno", pr."nombreProducto", pp."cantidadProducto", 'P' as tipo, pd.notas as "notas",
  zn."zona" as zona, cl."razonSocial" as "razonSocial", '' as origen, '' as destino
  from Pedidos pd
  inner join Usuarios us on pd."idUsuarioCrea"=us."idUsuario" 
  inner join Pedido_Producto pp on pp."idPedido"=pd."idPedido"
  inner join Productos pr on pr."idProducto"=pp."idProducto"
  inner join Clientes cl on cl."idCliente"=pd."idCliente"
  inner join Zonas zn on zn."idZona"=cl."idZona"
  where pd.impreso=0 and pd.listo=0 and pd.estado='1'
  union
  select tp."idTraspaso" as "idOrden", tp."nroOrden", us.usuario, tp."fechaCrea", pr."codInterno", pr."nombreProducto", tpr."cantidadProducto", 'T' as tipo, '' as "notas"
  ,'' as zona, '' as "razonSocial",
  (select nombre from Agencias where "idAgencia"=tp."idOrigen" 
   union select nombre from Bodegas where "idBodega"=tp."idOrigen"
   union select placa from Vehiculos where "placa"=tp."idOrigen") as "origen",
   (select nombre from Agencias where "idAgencia"=tp."idDestino" 
   union select nombre from Bodegas where "idBodega"=tp."idDestino"
   union select placa from Vehiculos where "placa"=tp."idDestino") as "destino"
  from Traspasos tp 
  inner join Usuarios us on us."idUsuario"=tp."idUsuario"
  inner join Traspaso_producto tpr on tpr."idTraspaso"=tp."idTraspaso"
  inner join Productos pr on tpr."idProducto"=pr."idProducto"
  where tp.movil=1 and tp.listo=0 and tp.impreso=0
  union 
  select tp."idTraspaso" as "idOrden", tp."nroOrden", us.usuario, tp."fechaCrea", pr."codInterno", pr."nombreProducto", tpr."cantidadProducto", 'T' as tipo, '' as "notas"
  ,'' as zona, '' as "razonSocial",
  (select nombre from Agencias where "idAgencia"=tp."idOrigen" 
   union select nombre from Bodegas where "idBodega"=tp."idOrigen"
   union select placa from Vehiculos where "placa"=tp."idOrigen") as "origen",
   (select nombre from Agencias where "idAgencia"=tp."idDestino" 
   union select nombre from Bodegas where "idBodega"=tp."idDestino"
   union select placa from Vehiculos where "placa"=tp."idDestino") as "destino"
  from Traspasos tp 
  inner join Usuarios us on us."idUsuario"=tp."idUsuario"
  inner join Traspaso_producto tpr on tpr."idTraspaso"=tp."idTraspaso"
  inner join Productos pr on tpr."idProducto"=pr."idProducto"
  where tp.movil=0 and tp.listo=0 and tp.impreso=0 and tp.estado='1' and tp."idOrigen"='AL001'
  `;
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      try {
        const notPrinted = await client.query(query);
        resolve(notPrinted.rows);
      } catch (err) {
        reject(err);
      }
    }, 100);
  });
}

function orderPrintedPos(params) {
  const query = `update Pedidos set impreso=1 where "idPedido"=${params.id}`;
  console.log("Query impresion", query);
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      try {
        const printed = await client.query(query);
        resolve(printed.rows);
      } catch (err) {
        reject(err);
      }
    }, 100);
  });
}

function orderToReadyPos(params) {
  console.log("Params del query", params);
  const central = params.idDepto == 1 ? ` and "idOrigen"='AL001' ` : "";
  const query = `
  select pd."idPedido" as "idOrden", concat(upper(pd.tipo),'0',cast(pd."idPedido" as varchar)) as "nroOrden", pd."fechaCrea",'P' as tipo, us.usuario, us."idDepto"
  from Pedidos pd inner join Usuarios us on us."idUsuario"=pd."idUsuarioCrea" where pd.impreso=1 and pd.listo=0 and pd.estado!='2' and us."idDepto"=${params.idDepto}
  union
  select tp."idTraspaso" as "idOrden", tp."nroOrden", tp."fechaCrea", 'T' as tipo, us.usuario, us."idDepto"
  from Traspasos tp inner join Usuarios us on us."idUsuario"=tp."idUsuario" where tp.impreso=1 and tp.listo=0 and tp.estado!='2' and us."idDepto"=${params.idDepto} ${central}`;
  return new Promise((resolve, reject) => {
    console.log("Query ", query);
    setTimeout(async () => {
      try {
        const printed = await client.query(query);
        resolve(printed.rows);
      } catch (err) {
        reject(err);
      }
    }, 100);
  });
}

function toRePrintDetailsPos(params) {
  const query = `select pd."idPedido", pd."fechaCrea",concat(upper(pd.tipo),'0',cast(pd."idPedido" as varchar)) as "nroOrden", 
  us.usuario, pr."codInterno", pr."nombreProducto" ,tp."cantidadProducto", pd."notas", cl."razonSocial",zn."zona", '' as origen, '' as destino
  from Pedidos pd
  inner join Pedido_Producto tp on pd."idPedido"=tp."idPedido"
  inner join Productos pr on pr."idProducto"=tp."idProducto" 
  inner join Usuarios us on us."idUsuario"=pd."idUsuarioCrea"
  inner join Clientes cl on pd."idCliente"=cl."idCliente"
  inner join Zonas zn on zn."idZona"=cl."idZona"
  where pd."idPedido"=${params.id}`;
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      try {
        const printed = await client.query(query);
        resolve(printed.rows);
      } catch (err) {
        reject(err);
      }
    }, 100);
  });
}

function changeReadyPos(params) {
  const isInterior = params.interior == 1 ? `, estado='1'` : "";
  const query = `update Pedidos set listo=${params.listo} ${isInterior} where "idPedido"=${params.id}`;
  return new Promise((resolve, reject) => {
    console.log("Query updateo", query);
    setTimeout(async () => {
      try {
        const changed = await client.query(query);
        resolve(changed.rows);
      } catch (err) {
        reject(err);
      }
    }, 100);
  });
}

function rejectReadyPos(params) {
  const query = `update Pedidos set listo=0, impreso=0, estado='0' where "idPedido"=${params.id}`;
  return new Promise((resolve, reject) => {
    console.log("Query rechazo", query);
    setTimeout(async () => {
      try {
        const changed = await client.query(query);
        resolve(changed.rows);
      } catch (err) {
        reject(err);
      }
    }, 100);
  });
}

async function updateVirtualStock(body) {
  console.log("Funcion de actualizar stock de almacen virtual");
  return new Promise(async (resolve, reject) => {
    const products = body.productos;
    const clientInfo = body.clientInfo;
    if (body.accion === "add") {
      client.query("BEGIN");
      var errCount = 0;
      for (var product of products) {
        const verifQuery = `select * from almacen_virtual where "idDepto"=(select "idDepartamento" from Zonas 
        where "idZona"=${clientInfo.idZona}) and "nitCliente"='${clientInfo.nitCliente}' and "idProducto"=${product.idProducto}`;
        try {
          const verified = await client.query(verifQuery);
          if (verified.rows.length > 0) {
            const updateQuery = `update almacen_virtual set "cant_Actual"="cant_Actual"+${product.cantProducto} where "nitCliente"='${clientInfo.nitCliente}' and "idDepto"=(select "idDepartamento" from Zonas 
            where "idZona"=${clientInfo.idZona}) and "idProducto"=${product.idProducto}`;
            try {
              const updated = await client.query(updateQuery);
              console.log("Stock updateado", updated);
            } catch (error) {
              errCount += 1;
              console.log("Error al actualizar stock virtual", error);
            }
          } else {
            const insertQuery = `insert into almacen_virtual ("idDepto","nitCliente","idProducto","cant_Actual", "idzona") 
            values ((select "idDepartamento" from Zonas where "idZona"=${clientInfo.idZona}),
            '${clientInfo.nitCliente}', ${product.idProducto}, ${product.cantProducto}, ${clientInfo.idZona})`;
            try {
              const inserted = await client.query(insertQuery);
              console.log("Producto insertado", inserted);
            } catch (error) {
              errCount += 1;
              console.log("Error al insertar", error);
            }
          }
        } catch (err) {
          client.query("ROLLBACK");
          reject(err);
        }
      }
      if (errCount > 0) {
        client.query("ROLLBACK");
        reject("Error al actualizar o insertar", errCount);
      } else {
        client.query("COMMIT");
        resolve(true);
      }
    } else {
      client.query("BEGIN");
      var errCount = 0;
      for (var product of products) {
        const updateQuery = `update almacen_virtual set "cant_Actual"="cant_Actual"-${product.cantProducto} where "nitCliente"='${clientInfo.nitCliente}' and "idDepto"=(select "idDepartamento" from Zonas 
        where "idZona"=${clientInfo.idZona}) and "idProducto"=${product.idProducto}`;
        try {
          const updated = await client.query(updateQuery);
          console.log("Stock updateado para restar", updated);
        } catch (error) {
          errCount += 1;
          console.log("Error al actualizar stock virtual", error);
        }
      }
      if (errCount > 0) {
        client.query("ROLLBACK");
        reject("Error al actualizar o insertar", errCount);
      } else {
        client.query("COMMIT");
        resolve(true);
      }
    }
  });
}

async function updateMultipleVirtualStock(bodies) {
  var errCount = 0;
  for (body of bodies) {
    try {
      await updateVirtualStock(body);
    } catch (err) {
      errCount += 1;
    }
  }
  return new Promise((resolve, reject) => {
    if (errCount > 0) {
      reject("Error al actualizar multiple");
    } else {
      resolve(true);
    }
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
  registerOrderPos,
  getOrderStatusPos,
  getOrderListPos,
  getUserOrderListPos,
  approveOrderPos,
  getOrderDetailsPos,
  getOrderTypePos,
  getOrderProductListPos,
  deleteOrderPos,
  cancelOrderPos,
  addProductOrderPos,
  deleteProductOrderPos,
  updateProductOrderPos,
  updateOrderPos,
  getOrdersToInvoicePos,
  getOrderToInvoiceDetailsPos,
  invoiceOrderPos,
  numberOfInvoicedPos,
  getNotPrintedPos,
  orderPrintedPos,
  orderToReadyPos,
  toRePrintDetailsPos,
  changeReadyPos,
  getAlltOrderListPos,
  rejectReadyPos,
  updateVirtualStock,
  updateMultipleVirtualStock,
};
