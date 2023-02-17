const express = require("express");
const sessionParams = require("../server");
const session = require("express-session");
const app = express();
const getRoles = require("../models//RolModel");
app.use(session(sessionParams));

module.exports = {
  getRoles: (req, res) => {
    const roles = getRoles.getRolesPos();
    roles.then((rol) => {
      res.status(200).send(rol);
    });
  },
};
