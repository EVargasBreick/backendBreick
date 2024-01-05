const { transactionOfUpdateStocks } = require("../models/store_model.js");
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
  getTransferListPos,
  createTransferPos,
  getTransferProductsPos,
  updateTransferPos,
  printTransferPos,
  changeReadyPos,
  toRePrintDetailsPos,
  addProductToTransferPos,
  deleteProductFromTransferPos,
  updateProductInTransferPos,
  updateChangedTransferPos,
  getTransitTransfersPos,
  acceptTransferPos,
  deleteTransferData,
} = require("../models/transfer_model.js");
const { client } = require("../postgressConn.js");

module.exports = {
  createTransfer: (req, res) => {
    const newTransfer = createTransferPos(req.body);
    newTransfer
      .then((resp) => {
        res.status(200).send(resp);
      })
      .catch((error) => {
        res.status(400).send(error);
      });
  },
  getTransferList: (req, res) => {
    const fetchedList = getTransferListPos(req.query);
    fetchedList.then((resp) => {
      res.status(200).send(JSON.stringify(resp.response));
    });
  },
  getTransferProducts: (req, res) => {
    const fetchedList = getTransferProductsPos(req.query);
    fetchedList.then((resp) => {
      res.status(200).send(resp);
    });
  },
  updateTransfer: (req, res) => {
    const update = updateTransferPos(req.body);
    update
      .then((resp) => {
        res.status(200).send(resp);
      })
      .catch((error) => {
        res.status(400).send(error);
      });
  },
  transferPrinted: (req, res) => {
    const update = printTransferPos(req.query);
    update
      .then((resp) => {
        res.status(200).send(resp);
      })
      .catch((err) => {
        res.status(400).send(err);
      });
  },
  toRePrint: (req, res) => {
    const orderList = toRePrintDetailsPos(req.query);
    orderList
      .then((list) => {
        res.status(200).send(list);
      })
      .catch((error) => {
        res.status(400).send(error);
      });
  },
  changeReady: (req, res) => {
    const changed = changeReadyPos(req.query);
    changed
      .then((list) => {
        res.status(200).send(list);
      })
      .catch((error) => {
        res.status(400).send(error);
      });
  },
  addProduct: (req, res) => {
    console.log("Flag 1");
    const changed = addProductToTransferPos(req.body);
    changed
      .then((list) => {
        res.status(200).send(list);
      })
      .catch((error) => {
        res.status(400).send(error);
      });
  },
  deleteProduct: (req, res) => {
    const changed = deleteProductFromTransferPos(req.query);
    changed
      .then((list) => {
        res.status(200).send(list);
      })
      .catch((error) => {
        res.status(400).send(error);
      });
  },
  updateProduct: (req, res) => {
    const changed = updateProductInTransferPos(req.body);
    changed
      .then((list) => {
        res.status(200).send(list);
      })
      .catch((error) => {
        res.status(400).send(error);
      });
  },
  updateChangedTransfer: (req, res) => {
    const changed = updateChangedTransferPos(req.body);
    changed
      .then((list) => {
        res.status(200).send(list);
      })
      .catch((error) => {
        res.status(400).send(error);
      });
  },
  transitTransfers: (req, res) => {
    const changed = getTransitTransfersPos(req.query);
    changed
      .then((list) => {
        res.status(200).send(list);
      })
      .catch((error) => {
        res.status(400).send(error);
      });
  },
  acceptTransfer: (req, res) => {
    const changed = acceptTransferPos(req.query);
    changed
      .then((list) => {
        res.status(200).send(list);
      })
      .catch((error) => {
        res.status(400).send(error);
      });
  },
  deleteTransfer: (req, res) => {
    const changed = deleteTransferData(req.query);
    changed
      .then((list) => {
        res.status(200).send(list);
      })
      .catch((error) => {
        res.status(400).send(error);
      });
  },
  composedEdit: (req, res) => {
    const changed = composedEditTransfer(req.body);
    changed
      .then((list) => {
        res.status(200).send(list);
      })
      .catch((error) => {
        res.status(400).send(error);
      });
  },
};

async function composedEditTransfer(body) {
  console.log("Body body", body);
  const { addProduct, deleteProduct, updateProduct, editTransfer, stock } =
    body;
  try {
    await client.query("BEGIN");
    const stockChanged = transactionOfUpdateStocks(stock, true);
    console.log("Stock updateado", stockChanged);
    await addProductToTransferPos(addProduct);
    await deleteProductFromTransferPos({
      body: JSON.stringify(deleteProduct),
    });
    await updateProductInTransferPos(updateProduct);
    const updated = await updateChangedTransferPos(editTransfer);
    await client.query("COMMIT");
    return updated;
  } catch (error) {
    console.log("Error en la edicion compuesta", error);
    client.query("ROLLBACK");
    return new Promise.reject(error);
  }
}
