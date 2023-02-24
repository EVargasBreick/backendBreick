const express = require("express");
const sessionParams = require("../server");
const session = require("express-session");
const app = express();
const {
  GeneralSalesReport,
  ProductsSalesReport,
  ClosingReport,
  FirstAndLast,
  GeneralSalesReportPos,
  ProductsSalesReportPos,
  ClosingReportPos,
  FirstAndLastPos,
} = require("../models/reports_model.js");
app.use(session(sessionParams));

module.exports = {
  generalSalesReport: (req, res) => {
    const data = GeneralSalesReportPos(req.query);
    data
      .then((dt) => {
        res.status(200).send(dt);
      })
      .catch((err) => {
        res.status(400).send(err);
      });
  },
  productSalesReport: (req, res) => {
    const data = ProductsSalesReportPos(req.query);
    data
      .then((dt) => {
        res.status(200).send(dt);
      })
      .catch((err) => {
        res.status(400).send(err);
      });
  },
  closingDayReport: (req, res) => {
    const data = ClosingReportPos(req.query);
    data
      .then((dt) => {
        res.status(200).send(dt);
      })
      .catch((err) => {
        res.status(400).send(err);
      });
  },
  firstAndLast: (req, res) => {
    const data = FirstAndLastPos(req.query);
    data
      .then((dt) => {
        res.status(200).send(dt);
      })
      .catch((err) => {
        res.status(400).send(err);
      });
  },
};
