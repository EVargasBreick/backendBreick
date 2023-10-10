const express = require("express");
const sessionParams = require("../server");
const session = require("express-session");
const app = express();
const getDays = require("../models/day_model");
app.use(session(sessionParams));

module.exports = {
  getDias: (req, res) => {
    const dias = getDays.getDaysPos();
    dias.then((dia) => {
      res.status(200).send(dia);
    }).catch((err) => {
      console.log(err);
      res.status(500).send(err);
    });;
  },
};
