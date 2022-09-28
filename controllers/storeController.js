const express = require("express");
const sessionParams = require("../server");
const session = require("express-session");
const app = express();
const getStores = require("../models/StoreModel");
app.use(session(sessionParams));

module.exports = {
  getStores: (req, res) => {
    const stores = getStores();
    stores.then((store) => {
      res.status(200).send(store);
    });
  },
};
