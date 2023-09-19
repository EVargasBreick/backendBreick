const express = require("express");
const sessionParams = require("../server");
const session = require("express-session");
const getDepartamentos = require("../models/state_model.js");
const app = express();

app.use(session(sessionParams));

module.exports = {
  getDepartamenos: (req, res) => {
    const roles = getDepartamentos.getDepartamentosPos();
    roles.then((rol) => {
      res.status(200).send(JSON.parse(rol));
    }).catch((err) => {
      console.log(err);
      res.status(500).send(err);
    });;
  },
};
