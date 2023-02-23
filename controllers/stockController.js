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
} = require("../models/StockModel");

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
};
