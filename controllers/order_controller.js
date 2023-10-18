const express = require("express");
const sessionParams = require("../server");
const session = require("express-session");
const {
  registerOrder,
  getOrderStatus,
  getOrderList,
  getOrderDetails,
  getOrderType,
  approveOrder,
  getOrderProductList,
  deleteOrder,
  cancelOrder,
  addProductOrder,
  updateProductOrder,
  updateOrder,
  deleteProductOrder,
  getUserOrderList,
  getOrdersToInvoice,
  getOrderToInvoiceDetails,
  invoiceOrder,
  getNotPrinted,
  orderPrinted,
  orderToReady,
  toRePrintDetails,
  changeReady,
  registerOrderPos,
  getOrderStatusPos,
  getOrderListPos,
  getUserOrderListPos,
  getOrderDetailsPos,
  getOrderTypePos,
  approveOrderPos,
  getOrderProductListPos,
  deleteOrderPos,
  cancelOrderPos,
  addProductOrderPos,
  updateProductOrderPos,
  updateOrderPos,
  deleteProductOrderPos,
  getOrdersToInvoicePos,
  getOrderToInvoiceDetailsPos,
  invoiceOrderPos,
  getNotPrintedPos,
  orderPrintedPos,
  orderToReadyPos,
  toRePrintDetailsPos,
  changeReadyPos,
  getAlltOrderListPos,
  rejectReadyPos,
  updateVirtualStock,
  updateMultipleVirtualStock,
} = require("../models/order_model");

const app = express();
app.use(session(sessionParams));
module.exports = {
  createNewOrder: async (req, res) => {
    try {
      const data = await registerOrderPos(req.body);
      const resp = JSON.parse(data);
      console.log(data);
      res.status(resp.code).send(resp);
    } catch (err) {
      console.error(err);
      res.status(500).send({
        message: err || "Some error occurred while creating the Order.",
      });
    }
  },
  getOrderStatus: (req, res) => {
    const orderStatus = getOrderStatusPos();
    orderStatus.then((stats) => {
      var resp = JSON.parse(stats);
      res.status(resp.code).send(resp);
    }).catch((err) => {
      console.log(err);
      res.status(500).send(err);
    });;
  },
  getOrderList: (req, res) => {
    const orderList = getOrderListPos(req.query);
    orderList.then((list) => {
      var resp = JSON.parse(list);
      res.status(resp.code).send(resp);
    }).catch((err) => {
      console.log(err);
      res.status(500).send(err);
    });;
  },
  getAllOrderList: (req, res) => {
    const orderList = getAlltOrderListPos(req.query);
    orderList.then((list) => {
      var resp = JSON.parse(list);
      res.status(resp.code).send(resp);
    }).catch((err) => {
      console.log(err);
      res.status(500).send(err);
    });;
  },
  getUserOrderList: (req, res) => {
    const orderList = getUserOrderListPos(req.query);
    orderList.then((list) => {
      var resp = JSON.parse(list);
      res.status(resp.code).send(resp);
    }).catch((err) => {
      console.log(err);
      res.status(500).send(err);
    });;
  },
  getOrderDetail: (req, res) => {
    const orderDetail = getOrderDetailsPos(req.query);
    orderDetail.then((order) => {
      var jsonOrder = JSON.parse(order);
      res.status(jsonOrder.code).send(jsonOrder);
    }).catch((err) => {
      console.log(err);
      res.status(500).send(err);
    });;
  },
  getOrderType: (req, res) => {
    const orderType = getOrderTypePos();
    orderType.then((type) => {
      var resp = JSON.parse(type);
      res.status(resp.code).send(resp);
    }).catch((err) => {
      console.log(err);
      res.status(500).send(err);
    });;
  },
  approveOrder: (req, res) => {
    const approvedOrder = approveOrderPos(req.query);
    approvedOrder.then((ao) => {
      var resp = JSON.parse(ao);
      res.status(resp.code).send(resp);
    }).catch((err) => {
      console.log(err);
      res.status(500).send(err);
    });;
  },
  orderProdList: (req, res) => {
    const prodList = getOrderProductListPos(req.query);
    prodList.then((pl) => {
      var resp = JSON.parse(pl);
      res.status(resp.code).send(resp);
    }).catch((err) => {
      console.log(err);
      res.status(500).send(err);
    });;
  },
  deleteOrder: (req, res) => {
    const deleted = deleteOrderPos(req.query);
    deleted
      .then((dl) => {
        res.status(200).send(dl);
      })
      .catch((error) => {
        res.status(400).send(error);
      });
  },
  cancelOrder: (req, res) => {
    const canceled = cancelOrderPos(req.query.id);
    canceled.then((cld) => {
      var resp = JSON.parse(cld);
      res.status(200).send(resp);
    }).catch((err) => {
      console.log(err);
      res.status(500).send(err);
    });;
  },
  addProductToOrder: (req, res) => {
    const added = addProductOrderPos(req.body);
    added.then((add) => {
      var resp = JSON.parse(add);
      res.status(200).send(resp);
    }).catch((err) => {
      console.log(err);
      res.status(500).send(err);
    });;
  },
  updateProductInOrder: (req, res) => {
    const updated = updateProductOrderPos(req.body);
    updated.then((upd) => {
      var resp = JSON.parse(upd);
      res.status(200).send(resp);
    }).catch((err) => {
      console.log(err);
      res.status(500).send(err);
    });;
  },
  updateOrder: (req, res) => {
    const updated = updateOrderPos(req.body);
    updated
      .then((upt) => {
        var resp = JSON.parse(upt);
        res.status(200).send(resp);
      })
      .catch((error) => {
        var resp = JSON.parse(error);
        res.status(400).send(resp);
      });
  },
  deleteProductOrder: (req, res) => {
    const deleted = deleteProductOrderPos(req.body);
    deleted
      .then((del) => {
        var resp = JSON.parse(del);
        res.status(200).send(resp);
      })
      .catch((error) => {
        res.status(400).send(error);
      });
  },
  ordersToInvoice: (req, res) => {
    const orderList = getOrdersToInvoicePos(req.query);
    orderList
      .then((list) => {
        var resp = JSON.parse(list);
        res.status(200).send(resp);
      })
      .catch((error) => {
        res.status(400).send(error);
      });
  },
  orderToInvoiceDetails: (req, res) => {
    const orderList = getOrderToInvoiceDetailsPos(req.query);
    orderList
      .then((list) => {
        var resp = JSON.parse(list);
        res.status(200).send(resp);
      })
      .catch((error) => {
        res.status(400).send(error);
      });
  },
  invoiceOrder: (req, res) => {
    const orderList = invoiceOrderPos(req.query);
    orderList
      .then((list) => {
        var resp = JSON.parse(list);
        res.status(200).send(resp);
      })
      .catch((error) => {
        res.status(400).send(error);
      });
  },
  notPrinted: (req, res) => {
    const orderList = getNotPrintedPos();
    orderList
      .then((list) => {
        res.status(200).send(list);
      })
      .catch((error) => {
        res.status(400).send(error);
      });
  },
  orderPrinted: (req, res) => {
    const orderList = orderPrintedPos(req.query);

    orderList
      .then((list) => {
        res.status(200).send(list);
      })
      .catch((error) => {
        res.status(400).send(error);
      });
  },
  orderToReady: (req, res) => {
    const orderList = orderToReadyPos(req.query);
    orderList
      .then((list) => {
        res.status(200).send(list);
      })
      .catch((error) => {
        res.status(400).send(error);
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
  rejectReady: (req, res) => {
    const changed = rejectReadyPos(req.query);
    changed
      .then((list) => {
        res.status(200).send(list);
      })
      .catch((error) => {
        res.status(400).send(error);
      });
  },
  updateVirtual: (req, res) => {
    const changed = updateVirtualStock(req.body);
    changed
      .then((list) => {
        res.status(200).send(list);
      })
      .catch((error) => {
        res.status(400).send(error);
      });
  },
  updateMultipleVirtual: (req, res) => {
    const changed = updateMultipleVirtualStock(req.body);
    changed
      .then((list) => {
        res.status(200).send(list);
      })
      .catch((error) => {
        res.status(400).send(error);
      });
  },
};
