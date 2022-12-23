const express = require("express");
const sessionParams = require("../server");
const session = require("express-session");
const getDepartamentos = require("../models/StateModel");
const app = express();

app.use(session(sessionParams));

module.exports = {
  getDepartamenos: (req, res) => {
    const roles = getDepartamentos();
    roles.then((rol) => {
      res.status(200).send(JSON.parse(rol));
    });
  },
};
