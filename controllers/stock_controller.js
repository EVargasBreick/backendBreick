const {
  getStockFromDateAndProduct,
  getStockFromDateAndStore,
  getCurrentProductStock,
  getCurrentStoreStock,
  initializeStock,
  getStockFromDateAndProductPos,
  getStockFromDateAndStorePos,
  getCurrentProductStockPos,
  getCurrentStoreStockPos,
  initializeStockPos,
  logProductEntry,
  getLoggedEntries,
  getStockCodes,
  getStockLogged,
} = require("../models/stock_model.js");

module.exports = {
  stockFromDateAndProduct: (req, res) => {
    const stock = getStockFromDateAndProductPos(req.query);
    stock
      .then((resp) => {
        res.status(200).send(resp);
      })
      .catch((error) => {
        res.status(400).send(error);
      });
  },
  stockFromDateAndStore: (req, res) => {
    const stock = getStockFromDateAndStorePos(req.query);
    stock
      .then((resp) => {
        res.status(200).send(resp);
      })
      .catch((error) => {
        res.status(400).send(error);
      });
  },
  currentProductStock: (req, res) => {
    const stock = getCurrentProductStockPos(req.query);
    stock
      .then((resp) => {
        res.status(200).send(resp);
      })
      .catch((error) => {
        res.status(400).send(error);
      });
  },
  currentStoreStock: (req, res) => {
    const stock = getCurrentStoreStockPos(req.query);
    stock
      .then((resp) => {
        res.status(200).send(resp);
      })
      .catch((error) => {
        res.status(400).send(error);
      });
  },
  initializeStock: (req, res) => {
    const stock = initializeStockPos(req.body);
    stock
      .then((resp) => {
        res.status(200).send(resp);
      })
      .catch((error) => {
        res.status(400).send(error);
      });
  },
  logEntry: (req, res) => {
    const stock = logProductEntry(req.body);
    stock
      .then((resp) => {
        res.status(200).send(resp);
      })
      .catch((error) => {
        res.status(400).send(error);
      });
  },
  getlogEntry: (req, res) => {
    const stock = getLoggedEntries(req.body);
    stock
      .then((resp) => {
        res.status(200).send(resp);
      })
      .catch((error) => {
        res.status(400).send(error);
      });
  },
  getStockCodes: (req, res) => {
    const stock = getStockCodes();
    stock
      .then((resp) => {
        res.status(200).send(resp);
      })
      .catch((error) => {
        res.status(400).send(error);
      });
  },
  getStockLogged: (req, res) => {
    const stock = getStockLogged(req.query);
    stock
      .then((resp) => {
        res.status(200).send(resp);
      })
      .catch((error) => {
        res.status(400).send(error);
      });
  },
};
