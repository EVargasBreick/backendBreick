const express = require("express");
const sessionParams = require("../server");
const session = require("express-session");
const app = express();
const { GeneralSalesReport } = require("../models/ReportsModel");
app.use(session(sessionParams));

module.exports = {
  generalSalesReport: (req, res) => {
    const data = GeneralSalesReport(req.query);
    data
      .then((dt) => {
        res.status(200).send(dt);
      })
      .catch((err) => {
        res.status(400).send(err);
      });
  },
};
