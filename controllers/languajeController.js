const express = require("express");
const sessionParams = require("../server");
const session = require("express-session");
const app = express();
const getLang = require("../models/LanguajeModel");
app.use(session(sessionParams));

module.exports = {
  getLanguajes: (req, res) => {
    const languajes = getLang();
    languajes.then((lang) => {
      res.status(200).send(lang);
    });
  },
};
