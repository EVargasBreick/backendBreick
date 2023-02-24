const express = require("express");
const sessionParams = require("../server");
const session = require("express-session");
const {
  xmlLogin,
  getLastId,
  authorizeInvoice,
  InvoiceOut,
  cancelInvoice,
} = require("../models/XmlModel.js");
const app = express();
app.use(session(sessionParams));
module.exports = {
  xmlLogin: (req, res) => {
    const loginResponse = xmlLogin(req.body);
    loginResponse
      .then((lr) => {
        res.status(200).send(lr);
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  },
  getLastId: (req, res) => {
    const idResponse = getLastId(req.body);
    idResponse
      .then((lr) => {
        res.status(200).send(lr);
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  },
  authorizeInvoice: (req, res) => {
    const authResponse = authorizeInvoice(req.body);
    authResponse
      .then((lr) => {
        res.status(200).send(lr);
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  },
  invoiceOut: (req, res) => {
    const invResponse = InvoiceOut(req.body);
    invResponse
      .then((lr) => {
        res.status(200).send(lr);
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  },
  cancelInvoice: (req, res) => {
    const cancelResponse = cancelInvoice(req.body);
    cancelResponse
      .then((lr) => {
        res.status(200).send(lr);
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  },
};
