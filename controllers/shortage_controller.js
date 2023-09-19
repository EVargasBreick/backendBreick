const express = require("express");
const sessionParams = require("../server");
const session = require("express-session");
const { logShortage, logShortagePos } = require("../models/shotage_model.js");

const app = express();

app.use(session(sessionParams));

module.exports = {
  logShortage: (req, res) => {
    const roles = logShortagePos(req.body);
    roles.then((rol) => {
      res.status(200).send(rol);
    }).catch((err) => {
      console.log(err);
      res.status(500).send(err);
    });;
  },
};
