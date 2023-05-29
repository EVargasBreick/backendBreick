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
    return JSON.stringify({ ...response.data, status: response.status });
  } catch (error) {
    return JSON.stringify("Error en Auth a Emizor");
  }
}

async function anularFactura(cuf_ackTicket_uniqueCode, unique_code = null) {
  try {
    const url = process.env.EMIZOR_URL + `/api/v1/facturas/${cuf_ackTicket_uniqueCode}/anular`
    const params = unique_code ? { unique_code: unique_code } : null
    // add query params axios delete
    const response = await axios.delete(
      url,
      {
        params: params
      }
    );
    return JSON.stringify({ data: response.data, status: response.status });
  } catch (error) {
    return JSON.stringify("Error en Anular Factura Emizor");
  }
}

module.exports = {
  postOauthToken,
  getEmizorToken,
  anularFactura
};
