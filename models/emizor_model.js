const axios = require("axios");
require("dotenv").config();
const dbConnection = require("../server");
const { client } = require("../postgressConn");
const secondsToDate = require("../services/secondsToDate");

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
  try {
    const response = await axios.post(
      process.env.EMIZOR_URL + "/oauth/token",
      {
        client_id: process.env.EMIZOR_CLIENT_ID,
        client_secret: process.env.EMIZOR_CLIENT_SECRET,
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

async function anularFactura(
  cuf_ackTicket_uniqueCode,
  unique_code = null,
  req
) {
  try {
    const url =
      process.env.EMIZOR_URL +
      `/api/v1/facturas/${cuf_ackTicket_uniqueCode}/anular`;
    const params = unique_code ? { unique_code: unique_code } : null;
    const authHeader = req.headers.authorization;
    const response = await axios.delete(url, {
      params: params,
      headers: {
        Authorization: authHeader,
      },
    });
    return JSON.stringify({ data: response.data, status: response.status });
  } catch (error) {
    return JSON.stringify({
      data: error?.response?.data ?? "Error Emizor Anulacion Factura",
      status: error?.response?.status ?? 500,
    });
  }
}

async function getPuntosVenta(req) {
  try {
    const url = process.env.EMIZOR_URL + `/api/v1/puntos-de-venta`;
    const authHeader = req.headers.authorization;
    const response = await axios.get(url, {
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

function postFactura(bodyFacturas, bodyFacturasInfo, req) {
  return new Promise(async (resolve, reject) => {
    try {
      let codigosLeyendaResponse = {};
      getCodigosLeyenda(req)
        .then((codigosLeyendaData) => {
          codigosLeyendaResponse = JSON.parse(codigosLeyendaData);
          bodyFacturas.codigoLeyenda =
            codigosLeyendaResponse.data.data[0].codigo;
        })
        .catch((error) => {
          reject(
            JSON.stringify({
              data: error?.response?.data ?? "Error Emizor Factura Leyenda",
              status: error?.response?.status ?? 500,
            })
          );
        });

      const url =
        process.env.EMIZOR_URL +
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
          leyenda: codigosLeyendaResponse.data.data[0],
        })
      );
    } catch (error) {
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
  try {
    const url = process.env.EMIZOR_URL + `/api/v1/parametricas/leyendas`;
    const authHeader = req.headers.authorization;
    const response = await axios.get(url, {
      headers: {
        Authorization: authHeader,
      },
    });
    return JSON.stringify({ data: response.data, status: response.status });
  } catch (error) {
    return JSON.stringify({
      data: error?.response?.data ?? "Error Emizor Codigos Leyenda",
      status: error?.response?.status ?? 500,
    });
  }
}

async function getEstadoFactura(req, ack_ticket) {
  try {
    const url =
      process.env.EMIZOR_URL + `/api/v1/facturas/${ack_ticket}/status`;
    const authHeader = req.headers.authorization;
    const response = await axios.get(url, {
      headers: {
        Authorization: authHeader,
      },
    });
    return JSON.stringify({ data: response.data, status: response.status });
  } catch (error) {
    return JSON.stringify({
      data: error?.response?.data ?? "Error Obteniendo Estado de Factura",
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
};
