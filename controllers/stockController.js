const {
  getStockFromDateAndProduct,
  getStockFromDateAndStore,
  getCurrentProductStock,
  getCurrentStoreStock,
} = require("../models/StockModel");

module.exports = {
  stockFromDateAndProduct: (req, res) => {
    const stock = getStockFromDateAndProduct(req.query);
    stock
      .then((resp) => {
        res.status(200).send(resp);
      })
      .catch((error) => {
        res.status(400).send(error);
      });
  },
  stockFromDateAndStore: (req, res) => {
    const stock = getStockFromDateAndStore(req.query);
    stock
      .then((resp) => {
        res.status(200).send(resp);
      })
      .catch((error) => {
        res.status(400).send(error);
      });
  },
  currentProductStock: (req, res) => {
    const stock = getCurrentProductStock(req.query);
    stock
      .then((resp) => {
        res.status(200).send(resp);
      })
      .catch((error) => {
        res.status(400).send(error);
      });
  },
  currentStoreStock: (req, res) => {
    const stock = getCurrentStoreStock(req.query);
    stock
      .then((resp) => {
        res.status(200).send(resp);
      })
      .catch((error) => {
        res.status(400).send(error);
      });
  },
};
