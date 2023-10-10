const express = require("express");
const sessionParams = require("../server");
const session = require("express-session");
const {
  getSeasonDiscount,
  currentSeasonDiscount,
  registerSeasonalDiscount,
  disableSeasonalDiscount,
} = require("../models/discount_model");
const app = express();
app.use(session(sessionParams));

module.exports = {
  getSeasonDiscounts: (req, res) => {
    const { currentDate, tipo } = req.query;
    const dList = getSeasonDiscount(currentDate, tipo);
    dList.then((discount) => {
      res.status(200).send(discount);
    });
  },
  getCurrentSeason: (req, res) => {
    const { startDate, endDate } = req.query;
    const dList = currentSeasonDiscount(startDate, endDate);
    dList.then((discount) => {
      res.status(200).send(discount);
    });
  },
  registerSeasonal: (req, res) => {
    const dList = registerSeasonalDiscount(req.body);
    dList
      .then((discount) => {
        res.status(200).send(discount);
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  },
  disabledSeasonal: (req, res) => {
    const { id } = req.query;
    const dList = disableSeasonalDiscount(id);
    dList
      .then((discount) => {
        res.status(200).send(discount);
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  },
};
