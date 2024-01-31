const logger = require("../logger-pino");
const { client } = require("../postgressConn");
const dbConnection = require("../server");
const { formatError } = require("../services/formatError");

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
              del
                .then(() => {
                  resolve(
                    JSON.stringify({
                      code: 400,
                      data: "Error",
                      message: "Products: " + prods.message,
                    })
                  );
                })
                .catch((err) => {
                  throw err;
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

function registerSalePos(data, idFactura) {
  console.log("Ventas", data, idFactura);
  const idPedido = data.pedido.idPedido != "" ? data.pedido.idPedido : 0;

  const {
    idUsuarioCrea,
    idCliente,
    fechaCrea,
    fechaActualizacion,
    montoTotal,
    descCalculado,
    descuento,
    montoFacturar,
    idFactura: idFacturaPedido,
  } = data.pedido;

  const descControlado = descuento == "" ? 0 : descuento;

  const queryAlt = `
  INSERT INTO Ventas 
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
  ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
  ) RETURNING "idVenta";
`;

  const values = [
    idUsuarioCrea,
    idCliente,
    fechaCrea,
    fechaActualizacion,
    toFixedDecimals(montoTotal),
    toFixedDecimals(descCalculado),
    descControlado,
    toFixedDecimals(montoFacturar),
    idPedido,
    idFactura ? idFactura : idFacturaPedido,
  ];

  const queryToLog = `
  INSERT INTO Ventas 
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
  ) VALUES (
      ${idUsuarioCrea},
      ${idCliente},
      '${fechaCrea}',
      '${fechaActualizacion}',
      ${toFixedDecimals(montoTotal)},
      ${toFixedDecimals(descCalculado)},
      ${descControlado},
      ${toFixedDecimals(montoFacturar)},
      ${idPedido},
      ${idFactura ? idFactura : idFacturaPedido}
  ) RETURNING "idVenta";
`;

  console.log("Creacion pedido query");
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      try {
        const newOrder = await client.query(queryAlt, values);
        const idCreado = newOrder.rows[0].idVenta;
        data.productos.map((producto) => {
          const { idProducto, cantProducto, descuentoProd, precioDeFabrica } =
            producto;
          const totalProducto =
            producto.total != undefined ? producto.total : producto.totalProd;

          const queryProdsAlt = `
                INSERT INTO Venta_Productos
                (
                   "idVenta", 
                    "idProducto", 
                    "cantidadProducto", 
                    "totalProd",
                    "descuentoProducto",
                    "precio_producto"
                ) VALUES (
                    $1, $2, $3, $4, $5, $6
                );
              `;

          const valuesProds = [
            idCreado,
            idProducto,
            cantProducto,
            toFixedDecimals(totalProducto),
            toFixedDecimals(descuentoProd),
            toFixedDecimals(precioDeFabrica),
          ];

          const queryProdsLog = `
          INSERT INTO Venta_Productos
          (
             "idVenta", 
              "idProducto", 
              "cantidadProducto", 
              "totalProd",
              "descuentoProducto",
              "precio_producto"
          ) VALUES (
              ${idCreado}, ${idProducto}, ${cantProducto}, ${toFixedDecimals(
            totalProducto
          )}, ${toFixedDecimals(descuentoProd)}, ${toFixedDecimals(
            precioDeFabrica
          )}
          );
        `;

          console.log("Insertando productos", queryProdsAlt);
          setTimeout(async () => {
            try {
              const prods = await client.query(queryProdsAlt, valuesProds);
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
              logger.error(
                "registerSalePosInsertProducts: " +
                  formatError(err) +
                  " Query prods: " +
                  queryProdsLog
              );
              const del = client.query(
                `delete from Ventas where "idVenta"=${idCreado}`
              );
              del
                .then(() => {
                  resolve(
                    JSON.stringify({
                      code: 400,
                      data: "Error",
                      message: "Products: " + err,
                    })
                  );
                })
                .catch((err) => {
                  logger.error(
                    `registerSalePos: 
                      ${formatError(err)} 
                      "Query: " 
                     ${queryToLog}`
                  );
                  throw err;
                });
            }
          }, 1000);
        });
      } catch (err) {
        logger.error(
          "registerSalePos: " + formatError(err) + "query: " + queryToLog
        );

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

const toFixedDecimals = (value) => {
  if (typeof value === "number") {
    return Number(value).toFixed(2);
  } else {
    return "0.00";
  }
};

module.exports = { registerSale, registerSalePos, deleteSale };
