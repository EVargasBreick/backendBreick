const express = require("express");
const sessionParams = require("../server");
const session = require("express-session");
const app = express();
const getRoles = require("../models/rol_model.js");
app.use(session(sessionParams));

module.exports = {
  getRoles: (req, res) => {
    const roles = getRoles.getRolesPos();
    roles.then((rol) => {
      res.status(200).send(rol);
    }).catch((err) => {
      console.log(err);
      res.status(500).send(err);
    });;
  },
};
