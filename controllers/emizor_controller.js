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
    try {
      const cuf_ackTicket_uniqueCode = req.params.cuf_ackTicket_uniqueCode;
      const unique_code = req.query.unique_code
      const anularPromise = await emizor.anularFactura(
        cuf_ackTicket_uniqueCode,
        unique_code
      );
      var responseObject = {}
      responseObject.message = "Factura anulada";
      responseObject.code = JSON.parse(anularPromise).status;
      res.status(responseObject.code).send(responseObject);
    } catch (error) {
      res.status(500).send("Error en el controlador de anularFactura");
    }
  },
};
