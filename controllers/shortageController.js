const express = require("express");
const sessionParams = require("../server");
const session = require("express-session");
const { logShortage, logShortagePos } = require("../models/ShortageModel");

const app = express();

app.use(session(sessionParams));

module.exports = {
  logShortage: (req, res) => {
    const roles = logShortagePos(req.body);
    roles.then((rol) => {
      res.status(200).send(rol);
    });
  },
};
