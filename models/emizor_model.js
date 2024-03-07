const axios = require("axios");
require("dotenv").config();
const dbConnection = require("../server");
const { client } = require("../postgressConn");
const secondsToDate = require("../services/secondsToDate");
const dateString = require("../services/dateServices");
const logger = require("../logger-pino");
const { formatError } = require("../services/formatError");

function updateTableToken(token, fechaHora) {
  return new Promise((resolve, reject) => {
    const isoFechaHora = secondsToDate(fechaHora);
    const query = `update emizortoken set  "token" = '${token}', "fechaHora" = '${isoFechaHora}' where "idToken"  = 1;`;
    client
      .query(query)
      .then((res) => {
        resolve(res);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

function getEmizorToken() {
  return new Promise((resolve, reject) => {
    // in query only get one row
    const query = `select * from emizortoken where "idToken" = 1 limit 1;`;
    client
      .query(query)
      .then((res) => {
        resolve(res.rows[0]);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

async function postOauthToken() {
  const url =
    process.env.TYPE == "local"
      ? process.env.TESTEMIZOR_URL
      : process.env.EMIZOR_URL;

  const client_secret =
    process.env.TYPE == "local"
      ? process.env.TESTEMIZOR_CLIENT_SECRET
      : process.env.EMIZOR_CLIENT_SECRET;
  const client_id =
    process.env.TYPE == "local"
      ? process.env.TESTEMIZOR_CLIENT_ID
      : process.env.EMIZOR_CLIENT_ID;
  console.log("Datos para emizor", url, client_id, client_secret);
  try {
    const response = await axios.post(
      url + "/oauth/token",
      {
        client_id: client_id,
        client_secret: client_secret,
        grant_type: "client_credentials",
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    await updateTableToken(
      response.data.access_token,
      response.data.expires_in
    );
    return JSON.stringify({ data: response.data, status: response.status });
  } catch (error) {
    return JSON.stringify({
      data: error?.response?.data ?? "Error Emizor Auth",
      status: error?.response?.status ?? 500,
    });
  }
}

async function anularFactura(cuf_ackTicket_uniqueCode, motivo, req) {
  const url =
    process.env.TYPE == "local"
      ? process.env.TESTEMIZOR_URL
      : process.env.EMIZOR_URL;
  console.log("URl para emizor", url);
  try {
    const urls = url + `/api/v1/facturas/${cuf_ackTicket_uniqueCode}/anular`;
    const authHeader = req.headers.authorization;
    const body = {
      codigoMotivoAnulacion: Number(motivo),
    };
    const response = await axios.delete(urls, {
      headers: {
        Authorization: authHeader,
      },
      data: body,
    });
    console.log("RESPONSE ANULAR", response);
    const dateResult = dateString();
    const cancelQuery = `update Facturas set estado=1, "fechaAnulacion"='${dateResult}' where cuf='${cuf_ackTicket_uniqueCode}'`;
    console.log("TCL: cancelQuery", cancelQuery);

    await client.query(cancelQuery);
    console.log("TCL: cancelQuery2", cancelQuery);
    return JSON.stringify({ data: response.data, status: response.status });
  } catch (error) {
    return JSON.stringify({
      data: error?.response?.data ?? "Error Emizor Anulacion Factura",
      status: error?.response?.status ?? 500,
    });
  }
}

async function getPuntosVenta(req) {
  const url =
    process.env.TYPE == "local"
      ? process.env.TESTEMIZOR_URL
      : process.env.EMIZOR_URL;
  console.log("URl para emizor", url);
  try {
    const urls = url + `/api/v1/puntos-de-venta`;
    const authHeader = req.headers.authorization;
    const response = await axios.get(urls, {
      headers: {
        Authorization: authHeader,
      },
    });
    return JSON.stringify({ data: response.data, status: response.status });
  } catch (error) {
    return JSON.stringify({
      data: error?.response?.data ?? "Error Emizor Punto VENTA",
      status: error?.response?.status ?? 500,
    });
  }
}

function getRandomNumber(n) {
  return Math.floor(Math.random() * (n + 1));
}

function postFactura(bodyFacturas, bodyFacturasInfo, req) {
  const urls =
    process.env.TYPE == "local"
      ? process.env.TESTEMIZOR_URL
      : process.env.EMIZOR_URL;
  console.log("URl para emizor", urls);
  return new Promise(async (resolve, reject) => {
    try {
      let codigosLeyendaResponse = {};
      getCodigosLeyenda(req)
        .then(async (codigosLeyendaData) => {
          codigosLeyendaResponse = JSON.parse(codigosLeyendaData);
          const random = getRandomNumber(
            codigosLeyendaResponse.data.data.length - 1
          );
          const selectedLegend = codigosLeyendaResponse.data.data[random];
          bodyFacturas.codigoLeyenda = selectedLegend.codigo;
          const url =
            urls +
            `/api/v1/sucursales/${bodyFacturasInfo.nroSucursal}/facturas/compra-venta`;
          const authHeader = req.headers.authorization;
          const response = await axios.post(url, bodyFacturas, {
            headers: {
              Authorization: authHeader,
            },
          });
          resolve(
            JSON.stringify({
              data: response.data,
              status: response.status,
              leyenda: selectedLegend,
            })
          );
        })
        .catch((error) => {
          logger.error(
            "postFactura: " + formatError(error) ?? "Error Emizor Factura"
          );
          console.log("Error", error);
          reject(
            JSON.stringify({
              data: error?.response?.data ?? "Error Emizor Factura Leyenda",
              status: error?.response?.status ?? 500,
            })
          );
        });
    } catch (error) {
      console.log("Error", error);
      logger.error(
        "postFactura: " + formatError(error) ?? "Error Emizor Factura"
      );
      reject(
        JSON.stringify({
          data: error?.response?.data ?? "Error Emizor Factura",
          status: error?.response?.status ?? 500,
        })
      );
    }
  });
}

async function getCodigosLeyenda(req) {
  const url =
    process.env.TYPE == "local"
      ? process.env.TESTEMIZOR_URL
      : process.env.EMIZOR_URL;
  console.log("URl para emizor", url);
  try {
    const urls = url + `/api/v1/parametricas/leyendas`;
    const authHeader = req.headers.authorization;
    const response = await axios.get(urls, {
      headers: {
        Authorization: authHeader,
      },
    });
    return JSON.stringify({ data: response.data, status: response.status });
  } catch (error) {
    console.log("ERROR AL OBTENER LEYENDAS", error);
    return JSON.stringify({
      data: error?.response?.data ?? "Error Emizor Codigos Leyenda",
      status: error?.response?.status ?? 500,
    });
  }
}

async function getEstadoFactura(req, ack_ticket) {
  console.log("Entrando a estado de factura", ack_ticket);
  const url =
    process.env.TYPE == "local"
      ? process.env.TESTEMIZOR_URL
      : process.env.EMIZOR_URL;
  console.log("URl para emizor", url);
  try {
    const urls = url + `/api/v1/facturas/${ack_ticket}/status`;
    const authHeader = req.headers.authorization;
    const response = await axios.get(urls, {
      headers: {
        Authorization: authHeader,
      },
    });
    return JSON.stringify({ data: response.data, status: response.status });
  } catch (error) {
    logger.error(
      "getEstadoFactura: " + formatError(error?.response?.data) ??
        "Error Obteniendo Estado de Factura"
    );
    return JSON.stringify({
      data: error?.response?.data ?? "Error Obteniendo Estado de Factura",
      status: error?.response?.status ?? 500,
    });
  }
}

async function getFacturaDB(uniqueCode) {
  try {
    const query = `SELECT "cufd", "nroFactura" , "nitCliente" 
    FROM Facturas
    WHERE split_part(autorizacion, '$', 1) = '${uniqueCode}';`;
    const response = await client.query(query);
    return JSON.stringify({ data: response.rows[0], status: 200 });
  } catch (error) {
    return JSON.stringify({
      data: error?.response?.data ?? "Error Obteniendo Estado de Factura",
      status: error?.response?.status ?? 500,
    });
  }
}

async function getFacturasDB(nit, userStore, date) {
  try {
    const params = [nit, userStore, date];
    console.log("user store", userStore, "date", date);
    const query = `SELECT *
    FROM Facturas
    WHERE "nitCliente"=$1
    and "idAgencia"=$2 and to_date("fechaHora", 'DD/MM/YYYY') = to_date($3, 'YYYY-MM-DD') 
    ORDER BY "fechaHora" ASC;`;
    console.log("Query fac", query);
    const response = await client.query(query, params);
    return JSON.stringify({ data: response.rows, status: 200 });
  } catch (error) {
    return JSON.stringify({
      data: error?.response?.data ?? "Error Obteniendo Facturas",
      status: error?.response?.status ?? 500,
    });
  }
}

async function getFacturasEmizor(cuf, req) {
  const url =
    process.env.TYPE == "local"
      ? process.env.TESTEMIZOR_URL
      : process.env.EMIZOR_URL;
  console.log("URl para emizor", url);
  try {
    const urls = url + `/api/v1/facturas/${cuf}`;
    const authHeader = req.headers.authorization;
    const response = await axios.get(urls, {
      headers: {
        Authorization: authHeader,
      },
    });
    return JSON.stringify({ data: response.data, status: response.status });
  } catch (error) {
    console.log("Error al obtener factura", error);
    return JSON.stringify({
      data: error?.response?.data ?? "Error Obteniendo Facturas",
      status: error?.response?.status ?? 500,
    });
  }
}

async function postProductoHomologado(bodyProducto, req) {
  const url =
    process.env.TYPE == "local"
      ? process.env.TESTEMIZOR_URL
      : process.env.EMIZOR_URL;
  console.log("URl para emizor", url);
  try {
    const urls = url + `/api/v1/productos`;
    const authHeader = req.headers.authorization;
    const response = await axios.post(urls, bodyProducto, {
      headers: {
        Authorization: authHeader,
      },
    });
    return JSON.stringify({ data: response.data, status: response.status });
  } catch (error) {
    return JSON.stringify({
      data: error?.response?.data ?? "Error Emizor Producto",
      status: error?.response?.status ?? 500,
    });
  }
}

async function getProductoHomologado(req) {
  const url =
    process.env.TYPE == "local"
      ? process.env.TESTEMIZOR_URL
      : process.env.EMIZOR_URL;
  console.log("URl para emizor", url);
  try {
    const urls = url + `/api/v1/productos`;
    const authHeader = req.headers.authorization;
    const response = await axios.get(urls, {
      headers: {
        Authorization: authHeader,
      },
    });
    return JSON.stringify({ data: response.data, status: response.status });
  } catch (error) {
    return JSON.stringify({
      data: error?.response?.data ?? "Error Emizor Producto",
      status: error?.response?.status ?? 500,
    });
  }
}

module.exports = {
  postOauthToken,
  getEmizorToken,
  anularFactura,
  getPuntosVenta,
  postFactura,
  getCodigosLeyenda,
  getEstadoFactura,
  getFacturaDB,
  getFacturasDB,
  getFacturasEmizor,
  postProductoHomologado,
  getProductoHomologado,
};
