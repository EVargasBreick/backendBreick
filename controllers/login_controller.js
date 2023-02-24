const express = require("express");
const sessionParams = require("../server");
const session = require("express-session");
const loginUser = require("../models/login_model");
const app = express();
app.use(session(sessionParams));

module.exports = {
  loginUser: (req, res) => {
    const userPromise = loginUser.loginUserPos(req.query);
    var responseObject = {};
    userPromise.then((userData) => {
      userResponse = JSON.parse(userData);
      console.log("Respuesta del login en el controlador", userResponse);
      if (userResponse.length > 0) {
        req.session.nombre = userResponse.nombre;
        req.session.rol = userResponse.rol;
        console.log(req.session.nombre);
        responseObject.data = userResponse;
        responseObject.message = "Usuario encontrado";
        responseObject.code = 200;
        res.status(responseObject.code).send(JSON.stringify(responseObject));
      } else {
        responseObject.data = [];
        responseObject.message = "Usuario no encontrado";
        responseObject.code = 200;
        res.status(responseObject.code).send(JSON.stringify(responseObject));
        req.session.destroy();
      }
    });
  },
};
