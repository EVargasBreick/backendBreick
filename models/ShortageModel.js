const dbConnection = require("../server");

function logShortage(body) {
  return new Promise((resolve) => {
    var addedData = [];

    body.products.map((product) => {
      setTimeout(async () => {
        const queryLog = `insert into Faltantes (idPedido, fecha, idUsuarioCrea, idProucto, faltante, idAgencia, idString, solicitado)
                values (${body.idPedido},'${body.fecha}',${body.idUsuarioCrea},${product.idProducto}, ${product.faltante}, '${body.idAgencia}', '${body.idString}', ${product.cantProducto})`;
        console.log("Query de loggeo", queryLog);
        const added = await dbConnection.executeQuery(queryLog);
        console.log("Agregado a faltantes", added);
        addedData.push(added);
      }, 100);
    });
    resolve(addedData);
  });
}

module.exports = { logShortage };
