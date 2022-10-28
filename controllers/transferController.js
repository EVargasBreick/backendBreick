const {
  createTransfer,
  getTransferList,
  getTransferProducts,
  updateTransfer,
} = require("../models/transferModel");

module.exports = {
  createTransfer: (req, res) => {
    const newTransfer = createTransfer(req.body);
    newTransfer
      .then((resp) => {
        res.status(200).send(resp);
      })
      .catch((error) => {
        res.status(400).send(error);
      });
  },
  getTransferList: (req, res) => {
    const fetchedList = getTransferList(req.query);
    fetchedList.then((resp) => {
      res.status(200).send(resp);
    });
  },
  getTransferProducts: (req, res) => {
    const fetchedList = getTransferProducts(req.query);
    fetchedList.then((resp) => {
      res.status(200).send(resp);
    });
  },
  updateTransfer: (req, res) => {
    const update = updateTransfer(req.body);
    update.then((resp) => {
      res.status(200).send(resp);
    });
  },
};
