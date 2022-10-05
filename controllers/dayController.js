const express = require("express");
const sessionParams = require("../server");
const session = require("express-session");
const app = express();
const getDays = require("../models/DayModel");
app.use(session(sessionParams));

module.exports = {
  getDias: (req, res) => {
    const dias = getDays();
    dias.then((dia) => {
      res.status(200).send(dia);
    });
  },
};
