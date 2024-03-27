const express = require("express");
const sessionParams = require("../server");
const session = require("express-session");
const emizor = require("../models/emizor_model");
const secondsToDate = require("../services/secondsToDate");
const { transactionOfUpdateStocks } = require("../models/store_model");
const app = express();
app.use(session(sessionParams));

module.exports = {
  postOauthToken: async (req, res) => {
    const userPromise = emizor.postOauthToken();
    var responseObject = {};
    userPromise
      .then((userData) => {
        userResponse = JSON.parse(userData);
        responseObject.data = userResponse.data;
        responseObject.code = userResponse.status;
        res.status(responseObject.code).send(responseObject);
      })
      .catch((err) => {
        console.log(err);
        res.status(500).send(err);
      });
  },

  deleteAnularFactura: async (req, res) => {
    const { cuf_ackTicket_uniqueCode, motivo } = req.params;
    const anularPromise = emizor.anularFactura(
      cuf_ackTicket_uniqueCode,
      motivo,
      req
    );
    anularPromise
      .then((anularData) => {
        var responseObject = {};
        const anularDataJSON = JSON.parse(anularData);
        responseObject.data = anularDataJSON;
        responseObject.code = anularDataJSON.status;
        res.status(responseObject.code).send(responseObject);
      })
      .catch((err) => {
        console.log(err);
        res.status(500).send(err);
      });
  },

  composedAnularFactura: async (req, res) => {
    console.log("ENTRANDO AL COMPUESTO DE ANULAR");
    const { cuf_ackTicket_uniqueCode, motivo } = req.params;
    const body = req.body;
    console.log("Datos recibidos", cuf_ackTicket_uniqueCode, motivo, body);
    const anularPromise = emizor.anularFactura(
      cuf_ackTicket_uniqueCode,
      motivo,
      req
    );
    anularPromise
      .then(async (anularData) => {
        var responseObject = {};
        const anularDataJSON = JSON.parse(anularData);
        responseObject.data = anularDataJSON;
        responseObject.code = anularDataJSON.status;
        if (anularDataJSON.status == 200) {
          const maxRetries = 1;
          const retry = 0;
          while (retry < maxRetries) {
            try {
              const updatedStock = await transactionOfUpdateStocks([body]);
              if (updatedStock.code == 200) {
                console.log("Stock updateado", updatedStock);
                res.status(responseObject.code).send(responseObject);
                break;
              }
            } catch (err) {
              console.log("Reintentando aumento de stock", err);
              retry++;
            }
          }
        } else {
          res.status(anularDataJSON.status).send(anularDataJSON);
        }
      })
      .catch((err) => {
        console.log(err);
        res.status(500).send(err);
      });
  },

  getPuntosVenta: async (req, res) => {
    const puntosVentaPromise = emizor.getPuntosVenta(req);
    var responseObject = {};
    puntosVentaPromise
      .then((puntosVentaData) => {
        puntosVentaResponse = JSON.parse(puntosVentaData);
        responseObject.data = puntosVentaResponse.data;
        responseObject.code = puntosVentaResponse.status;
        res.status(responseObject.code).send(responseObject);
      })
      .catch((err) => {
        console.log(err);
        res.status(500).send(err);
      });
  },

  getCodigosLeyenda: async (req, res) => {
    const codigosLeyendaPromise = emizor.getCodigosLeyenda(req);
    var responseObject = {};
    codigosLeyendaPromise
      .then((codigosLeyendaData) => {
        codigosLeyendaResponse = JSON.parse(codigosLeyendaData);
        responseObject.data = codigosLeyendaResponse.data;
        responseObject.code = codigosLeyendaResponse.status;
        res.status(responseObject.code).send(responseObject);
      })
      .catch((err) => {
        console.log(err);
        res.status(500).send(err);
      });
  },

  getFacturaDB: async (req, res) => {
    const { uniqueCode } = req.params;
    const facturaPromise = emizor.getFacturaDB(uniqueCode);
    var responseObject = {};
    facturaPromise
      .then((facturaData) => {
        facturaResponse = JSON.parse(facturaData);
        responseObject.data = facturaResponse.data;
        responseObject.code = facturaResponse.status;
        res.status(responseObject.code).send(responseObject);
      })
      .catch((err) => {
        console.log(err);
        res.status(500).send(err);
      });
  },

  getFacturasDB: async (req, res) => {
    const { nit } = req.params;
    const { userStore, date } = req.query;
    console.log("req.query", req.query);
    const facturasPromise = emizor.getFacturasDB(nit, userStore, date);
    var responseObject = {};
    facturasPromise
      .then((facturasData) => {
        facturasResponse = JSON.parse(facturasData);
        responseObject.data = facturasResponse.data;
        responseObject.code = facturasResponse.status;
        res.status(responseObject.code).send(responseObject);
      })
      .catch((err) => {
        console.log(err);
        res.status(500).send(err);
      });
  },

  getFacturasEmizor: async (req, res) => {
    const { cuf } = req.params;
    const facturasPromise = emizor.getFacturasEmizor(cuf, req);
    var responseObject = {};
    facturasPromise
      .then((facturasData) => {
        facturasResponse = JSON.parse(facturasData);
        responseObject.data = facturasResponse.data;
        responseObject.code = facturasResponse.status;
        res.status(responseObject.code).send(responseObject);
      })
      .catch((err) => {
        console.log(err);
        res.status(500).send(err);
      });
  },

  postProductoHomologado: async (req, res) => {
    const { bodyProducto } = req.params;
    const productoPromise = emizor.postProductoHomologado(bodyProducto, req);
    var responseObject = {};
    productoPromise
      .then((productoData) => {
        productoResponse = JSON.parse(productoData);
        responseObject.data = productoResponse.data;
        responseObject.code = productoResponse.status;
        res.status(responseObject.code).send(responseObject);
      })
      .catch((err) => {
        console.log(err);
        res.status(500).send(err);
      });
  },

  getProductoHomologado: async (req, res) => {
    const productoPromise = emizor.getProductoHomologado(req);
    var responseObject = {};
    productoPromise
      .then((productoData) => {
        productoResponse = JSON.parse(productoData);
        responseObject.data = productoResponse.data;
        responseObject.code = productoResponse.status;
        res.status(responseObject.code).send(responseObject);
      })
      .catch((err) => {
        console.log(err);
        res.status(500).send(err);
      });
  },
};
