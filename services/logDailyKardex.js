const { client } = require("../postgressConn");

async function testLogging(retries = 4) {
  const query = `
    BEGIN;
    INSERT INTO Log_Kardex (fecha, "idProducto", "cantidad", "idAgencia")
    SELECT now()::TIMESTAMP::DATE, "idProducto", "cant_Actual", "idAgencia" FROM Stock_Agencia;
    INSERT INTO Log_Kardex (fecha, "idProducto", "cantidad", "idAgencia")
    SELECT now()::TIMESTAMP::DATE, "idProducto", "cant_Actual", "idBodega" FROM Stock_Bodega;
    INSERT INTO Log_Kardex (fecha, "idProducto", "cantidad", "idAgencia")
    SELECT now()::TIMESTAMP::DATE, "idProducto", "cant_Actual", "idVehiculo" FROM Stock_Agencia_Movil;
    COMMIT;
  `;

  try {
    const added = await client.query(query);
    console.log("Stock logged successfully at", new Date());
  } catch (err) {
    console.error("Error logging stock:", err);
    if (retries > 0) {
      console.log(`Retrying (${retries} retries left)...`);
      await sleep(5000); // Wait for 5 seconds before retrying
      await testLogging(retries - 1); // Retry recursively with decremented retries
    } else {
      console.error("Maximum retries reached. Logging failed.");
    }
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = testLogging;
