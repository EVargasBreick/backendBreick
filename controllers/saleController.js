const express = require("express");
const sessionParams = require("../server");
const session = require("express-session");
const { registerSale } = require("../models/SaleModel");

const app = express();
app.use(session(sessionParams));

module.exports = {
  createNewSale: (req, res) => {
    const promise = registerSale(req.body);
    promise.then((data) => {
      var resp = JSON.parse(data);
      console.log(data);
      res.status(resp.code).send(resp);
    });
  },
};
