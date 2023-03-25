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
  updateFullStockPos,
  getStoresPos,
  getOnlyStoresPos,
  getUserStockPos,
  verifyAvailabilityPos,
  updateProductStockPos,
  getSalePointsPos,
  getSalePointsAndStorePos,
  getMobileSalePointsPos,
} = require("../models/store_model.js");
app.use(session(sessionParams));

module.exports = {
  getStores: (req, res) => {
    const stores = getStoresPos();
    stores.then((store) => {
      res.status(200).send(store);
    });
  },
  getOnlyStores: (req, res) => {
    const stores = getOnlyStoresPos();
    stores.then((store) => {
      res.status(200).send(store);
    });
  },
  getUserStock: (req, res) => {
    const stock = getUserStockPos(req.query);
    stock.then((st) => {
      res.status(200).send(JSON.parse(st));
    });
  },
  getProductAvailability: (req, res) => {
    const available = verifyAvailabilityPos(req.body);
    available.then((ava) => {
      res.status(200).send(ava);
    });
  },
  updateProductStock: (req, res) => {
    const updated = updateProductStockPos(req.body);
    updated
      .then((upd) => {
        res.status(200).send(upd);
      })
      .catch((error) => {
        res.status(400).send(error);
      });
  },
  updateFulltStock: (req, res) => {
    const updated = updateFullStockPos(req.body);
    updated
      .then((upd) => {
        res.status(200).send(upd);
      })
      .catch((error) => {
        res.status(400).send(error);
      });
  },
  getSalePoints: (req, res) => {
    const updated = getSalePointsPos(req.query);
    updated
      .then((upd) => {
        res.status(200).send(upd);
      })
      .catch((error) => {
        res.status(400).send(error);
      });
  },
  getMobileSalePoints: (req, res) => {
    const updated = getMobileSalePointsPos(req.query);
    updated
      .then((upd) => {
        res.status(200).send(upd);
      })
      .catch((error) => {
        res.status(400).send(error);
      });
  },
  getSalePointsAndStore: (req, res) => {
    const updated = getSalePointsAndStorePos(req.query);
    updated
      .then((upd) => {
        res.status(200).send(upd);
      })
      .catch((error) => {
        res.status(400).send(error);
      });
  },
};
