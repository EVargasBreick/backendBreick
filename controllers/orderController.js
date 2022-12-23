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
} = require("../models/OrderModel");

const app = express();
app.use(session(sessionParams));
module.exports = {
  createNewOrder: (req, res) => {
    const promise = registerOrder(req.body);
    promise.then((data) => {
      var resp = JSON.parse(data);
      console.log(data);
      res.status(resp.code).send(resp);
    });
  },
  getOrderStatus: (req, res) => {
    const orderStatus = getOrderStatus();
    orderStatus.then((stats) => {
      var resp = JSON.parse(stats);
      res.status(resp.code).send(resp);
    });
  },
  getOrderList: (req, res) => {
    const orderList = getOrderList(req.query);
    orderList.then((list) => {
      var resp = JSON.parse(list);
      res.status(resp.code).send(resp);
    });
  },
  getUserOrderList: (req, res) => {
    const orderList = getUserOrderList(req.query);
    orderList.then((list) => {
      var resp = JSON.parse(list);
      res.status(resp.code).send(resp);
    });
  },
  getOrderDetail: (req, res) => {
    const orderDetail = getOrderDetails(req.query);
    orderDetail.then((order) => {
      var jsonOrder = JSON.parse(order);
      res.status(jsonOrder.code).send(jsonOrder);
    });
  },
  getOrderType: (req, res) => {
    const orderType = getOrderType();
    orderType.then((type) => {
      var resp = JSON.parse(type);
      res.status(resp.code).send(resp);
    });
  },
  approveOrder: (req, res) => {
    const approvedOrder = approveOrder(req.query);
    approvedOrder.then((ao) => {
      var resp = JSON.parse(ao);
      res.status(resp.code).send(resp);
    });
  },
  orderProdList: (req, res) => {
    const prodList = getOrderProductList(req.query);
    prodList.then((pl) => {
      var resp = JSON.parse(pl);
      res.status(resp.code).send(resp);
    });
  },
  deleteOrder: (req, res) => {
    const deleted = deleteOrder(req.params);
    deleted
      .then((dl) => {
        var resp = JSON.parse(dl);
        res.status(200).send(resp);
      })
      .catch((error) => {
        var resp = JSON.parse(error);
        res.status(400).send(resp);
      });
  },
  cancelOrder: (req, res) => {
    const canceled = cancelOrder(req.query.id);
    canceled.then((cld) => {
      var resp = JSON.parse(cld);
      res.status(200).send(resp);
    });
  },
  addProductToOrder: (req, res) => {
    const added = addProductOrder(req.body);
    added.then((add) => {
      var resp = JSON.parse(add);
      res.status(200).send(resp);
    });
  },
  updateProductInOrder: (req, res) => {
    const updated = updateProductOrder(req.body);
    updated.then((upd) => {
      var resp = JSON.parse(upd);
      res.status(200).send(resp);
    });
  },
  updateOrder: (req, res) => {
    const updated = updateOrder(req.body);
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
    const deleted = deleteProductOrder(req.body);
    deleted
      .then((del) => {
        var resp = JSON.parse(del);
        res.status(200).send(resp);
      })
      .catch((error) => {
        res.status(400).send(error);
      });
  },
};
