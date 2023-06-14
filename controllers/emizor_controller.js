const express = require("express");
const sessionParams = require("../server");
const session = require("express-session");
const emizor = require("../models/emizor_model");
const secondsToDate = require("../services/secondsToDate");
const { use } = require("../routes/user");
const app = express();
app.use(session(sessionParams));

module.exports = {
  postOauthToken: async (req, res) => {
    const userPromise = emizor.postOauthToken();
    var responseObject = {};
    userPromise.then((userData) => {
      userResponse = JSON.parse(userData);
      responseObject.data = userResponse.data;
      responseObject.code = userResponse.status;
      res.status(responseObject.code).send(responseObject);
    });
  },


  deleteAnularFactura: async (req, res) => {
    const { cuf_ackTicket_uniqueCode, motivo } = req.params;
    const anularPromise = emizor.anularFactura(
      cuf_ackTicket_uniqueCode,
      motivo,
      req
    );
    anularPromise.then((anularData) => {
      var responseObject = {}
      const anularDataJSON = JSON.parse(anularData);
      responseObject.data = anularDataJSON;
      responseObject.code = anularDataJSON.status;
      res.status(responseObject.code).send(responseObject);
    });
  },

  getPuntosVenta: async (req, res) => {
    const puntosVentaPromise = emizor.getPuntosVenta(req);
    var responseObject = {};
    puntosVentaPromise.then((puntosVentaData) => {
      puntosVentaResponse = JSON.parse(puntosVentaData);
      responseObject.data = puntosVentaResponse.data;
      responseObject.code = puntosVentaResponse.status;
      res.status(responseObject.code).send(responseObject);
    });
  },

  getCodigosLeyenda: async (req, res) => {
    const codigosLeyendaPromise = emizor.getCodigosLeyenda(req);
    var responseObject = {};
    codigosLeyendaPromise.then((codigosLeyendaData) => {
      codigosLeyendaResponse = JSON.parse(codigosLeyendaData);
      responseObject.data = codigosLeyendaResponse.data;
      responseObject.code = codigosLeyendaResponse.status;
      res.status(responseObject.code).send(responseObject);
    });
  },

  getFacturaDB: async (req, res) => {
    const { uniqueCode } = req.params;
    const facturaPromise = emizor.getFacturaDB(uniqueCode);
    var responseObject = {};
    facturaPromise.then((facturaData) => {
      facturaResponse = JSON.parse(facturaData);
      responseObject.data = facturaResponse.data;
      responseObject.code = facturaResponse.status;
      res.status(responseObject.code).send(responseObject);
    });
  },

  getFacturasDB: async (req, res) => {
    const { nit } = req.params;
    const facturasPromise = emizor.getFacturasDB(nit);
    var responseObject = {};
    facturasPromise.then((facturasData) => {
      facturasResponse = JSON.parse(facturasData);
      responseObject.data = facturasResponse.data;
      responseObject.code = facturasResponse.status;
      res.status(responseObject.code).send(responseObject);
    });
  }
};
