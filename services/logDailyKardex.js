const { client } = require("../postgressConn");
function testLogging() {
  const query = `insert into Log_Kardex (fecha, "idProducto","cantidad","idAgencia")
  select now()::TIMESTAMP::DATE, "idProducto", "cant_Actual","idAgencia" from Stock_Agencia;
  insert into Log_Kardex (fecha, "idProducto","cantidad","idAgencia")
  select now()::TIMESTAMP::DATE, "idProducto", "cant_Actual","idBodega" from Stock_Bodega;
  insert into Log_Kardex (fecha, "idProducto","cantidad","idAgencia")
  select now()::TIMESTAMP::DATE, "idProducto", "cant_Actual","idVehiculo" from Stock_Agencia_Movil;`;
  setTimeout(async () => {
    const added = await client.query(query);
    try {
      console.log("Stock loggeado correctamente en fecha/hora", new Date());
    } catch (err) {
      console.log(err);
    }
  }, 100);
}

module.exports = testLogging;
