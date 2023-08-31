const express = require("express");
const sessionParams = require("../server");
const session = require("express-session");
const {
  registerSale,
  registerSalePos,
  deleteSale,
} = require("../models/sale_modal.js");

const app = express();
app.use(session(sessionParams));

module.exports = {
  createNewSale: (req, res) => {
    const promise = registerSalePos(req.body);
    promise.then((data) => {
      var resp = JSON.parse(data);
      console.log(data);
      res.status(200).send(resp);
    });
  },
  deleteSale: (req, res) => {
    const deleted = deleteSale(req.query);
    deleted
      .then((resp) => {
        res.status(200).send(resp);
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  },
};
