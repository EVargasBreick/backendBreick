const express = require("express");
const sessionParams = require("../server");
const session = require("express-session");
const app = express();
const getZones = require("../models/ZoneModel");
app.use(session(sessionParams));

module.exports = {
  getZonas: (req, res) => {
    const zonas = getZones();
    zonas.then((zona) => {
      res.status(200).send(zona);
    });
  },
};
