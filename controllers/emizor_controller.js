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
      console.log("Respuesta del login en el controlador", userResponse);
      if (userResponse.status === 400) {
        responseObject.message = "Usuario no encontrado";
        responseObject.code = 400;
        res.status(responseObject.code).send(responseObject);
        req.session.destroy();
      } else if (userResponse.status === 401) {
        responseObject.message = "Usuario no autorizado";
        responseObject.code = 401;
        res.status(responseObject.code).send(responseObject);
        req.session.destroy();
      } else if (userResponse.status === 200) {
        userResponse.expires_in = secondsToDate(userResponse.expires_in);
        responseObject.message = "Usuario encontrado";
        responseObject.data = userResponse;
        responseObject.code = 200;
        res.status(responseObject.code).send(responseObject);
      } else {
        responseObject.message = "Error en la peticion";
        responseObject.code = 500;
        res.status(responseObject.code).send(responseObject);
        req.session.destroy();
      }
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
      console.log("Error en el controlador de anularFactura", error);
      res.status(500).send("Error en el controlador de anularFactura");
    }
  },
};
