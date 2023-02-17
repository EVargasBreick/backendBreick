const express = require("express");
const sessionParams = require("../server");
const session = require("express-session");
const app = express();
const { getLangPos } = require("../models/LanguajeModel");
app.use(session(sessionParams));

module.exports = {
  getLanguajes: (req, res) => {
    const languajes = getLangPos();
    languajes.then((lang) => {
      res.status(200).send(lang);
    });
  },
};
