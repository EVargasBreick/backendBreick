const express = require("express");
const sessionParams = require("../server");
const session = require("express-session");
const app = express();
const {
  getStores,
  getUserStock,
  verifyAvailability,
  updateProductStock,
  updateFullStock,
  getOnlyStores,
  getSalePoints,
  getSalePointsAndStore,
} = require("../models/StoreModel");
app.use(session(sessionParams));

module.exports = {
  getStores: (req, res) => {
    const stores = getStores();
    stores.then((store) => {
      res.status(200).send(store);
    });
  },
  getOnlyStores: (req, res) => {
    const stores = getOnlyStores();
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
  getProductAvailability: (req, res) => {
    const available = verifyAvailability(req.body);
    available.then((ava) => {
      res.status(200).send(ava);
    });
  },
  updateProductStock: (req, res) => {
    const updated = updateProductStock(req.body);
    updated
      .then((upd) => {
        res.status(200).send(upd);
      })
      .catch((error) => {
        res.status(400).send(error);
      });
  },
  updateFulltStock: (req, res) => {
    const updated = updateFullStock(req.body);
    updated
      .then((upd) => {
        res.status(200).send(upd);
      })
      .catch((error) => {
        res.status(400).send(error);
      });
  },
  getSalePoints: (req, res) => {
    const updated = getSalePoints(req.query);
    updated
      .then((upd) => {
        res.status(200).send(upd);
      })
      .catch((error) => {
        res.status(400).send(error);
      });
  },
  getSalePointsAndStore: (req, res) => {
    const updated = getSalePointsAndStore(req.query);
    updated
      .then((upd) => {
        res.status(200).send(upd);
      })
      .catch((error) => {
        res.status(400).send(error);
      });
  },
};
