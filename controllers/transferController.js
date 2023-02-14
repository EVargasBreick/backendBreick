const {
  createTransfer,
  getTransferList,
  getTransferProducts,
  updateTransfer,
  printTransfer,
  toRePrintDetails,
  changeReady,
  addProductToTransfer,
  deleteProductFromTransfer,
  updateProductInTransfer,
  updateChangedTransfer,
  getTransitTransfers,
  acceptTransfer,
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
      res.status(200).send(JSON.stringify(resp.response.data));
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
  addProduct: (req, res) => {
    const changed = addProductToTransfer(req.body);
    changed
      .then((list) => {
        res.status(200).send(list);
      })
      .catch((error) => {
        res.status(400).send(error);
      });
  },
  deleteProduct: (req, res) => {
    const changed = deleteProductFromTransfer(req.query);
    changed
      .then((list) => {
        res.status(200).send(list);
      })
      .catch((error) => {
        res.status(400).send(error);
      });
  },
  updateProduct: (req, res) => {
    const changed = updateProductInTransfer(req.body);
    changed
      .then((list) => {
        res.status(200).send(list);
      })
      .catch((error) => {
        res.status(400).send(error);
      });
  },
  updateChangedTransfer: (req, res) => {
    const changed = updateChangedTransfer(req.body);
    changed
      .then((list) => {
        res.status(200).send(list);
      })
      .catch((error) => {
        res.status(400).send(error);
      });
  },
  transitTransfers: (req, res) => {
    const changed = getTransitTransfers(req.query);
    changed
      .then((list) => {
        res.status(200).send(list);
      })
      .catch((error) => {
        res.status(400).send(error);
      });
  },
  acceptTransfer: (req, res) => {
    const changed = acceptTransfer(req.query);
    changed
      .then((list) => {
        res.status(200).send(list);
      })
      .catch((error) => {
        res.status(400).send(error);
      });
  },
};
