const express = require("express");
const sessionParams = require("../server");
const session = require("express-session");
const app = express();
const { getStores, getUserStock } = require("../models/StoreModel");
app.use(session(sessionParams));

module.exports = {
  getStores: (req, res) => {
    const stores = getStores();
    stores.then((store) => {
      res.status(200).send(store);
    });
  },
  getUserStock: (req, res) => {
    const stock = getUserStock(req.query);
    stock.then((st) => {
      res.status(200).send(JSON.parse(st));
    });
  },
};
