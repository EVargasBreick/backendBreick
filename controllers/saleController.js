const express = require("express");
const sessionParams = require("../server");
const session = require("express-session");
const { registerSale, registerSalePos } = require("../models/SaleModel.js");

const app = express();
app.use(session(sessionParams));

module.exports = {
  createNewSale: (req, res) => {
    const promise = registerSalePos(req.body);
    promise.then((data) => {
      var resp = JSON.parse(data);
      console.log(data);
      res.status(resp.code).send(resp);
    });
  },
};
