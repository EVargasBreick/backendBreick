const {
  createTransfer,
  getTransferList,
  getTransferProducts,
  updateTransfer,
  printTransfer,
  toRePrintDetails,
  changeReady,
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
  transferPrinted: (req, res) => {
    const update = printTransfer(req.query);
    update
      .then((resp) => {
        res.status(200).send(resp);
      })
      .catch((err) => {
        res.status(400).send(err);
      });
  },
  toRePrint: (req, res) => {
    const orderList = toRePrintDetails(req.query);
    orderList
      .then((list) => {
        res.status(200).send(list);
      })
      .catch((error) => {
        res.status(400).send(error);
      });
  },
  changeReady: (req, res) => {
    const changed = changeReady(req.query);
    changed
      .then((list) => {
        res.status(200).send(list);
      })
      .catch((error) => {
        res.status(400).send(error);
      });
  },
};
