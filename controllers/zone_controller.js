const express = require("express");
const sessionParams = require("../server");
const session = require("express-session");
const app = express();
const { getZones, getZonesPos } = require("../models/zone_model.js");
app.use(session(sessionParams));

module.exports = {
  getZonas: (req, res) => {
    const zonas = getZonesPos();
    zonas.then((zona) => {
      res.status(200).send(zona);
    }).catch((err) => {
      console.log(err);
      res.status(500).send(err);
    });;
  },
};
