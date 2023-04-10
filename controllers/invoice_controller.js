const express = require("express");
const sessionParams = require("../server");
const session = require("express-session");
const {
  createInvoice,
  deleteInvoice,
  getInvoiceProducts,
  cancelInvoice,
  getOtherPayments,
  createInvoicePos,
  deleteInvoicePos,
  getInvoiceProductsPos,
  cancelInvoicePos,
  getOtherPaymentsPos,
  updateInvoicePos,
  logIncompleteInvoice,
} = require("../models/invoice_model");
const app = express();
app.use(session(sessionParams));

module.exports = {
  createNewInvoice: (req, res) => {
    const promise = createInvoicePos(req.body);
    promise
      .then((data) => {
        var resp = data;
        res.status(200).send(resp);
      })
      .catch((error) => {
        var resp = error;
        res.status(400).send(resp);
      });
  },
  deleteInvoice: (req, res) => {
    const deleted = deleteInvoicePos(req.query.id);
    deleted
      .then((del) => {
        res.status(200).send(del);
      })
      .catch((err) => {
        res.status(400).send(err);
      });
  },
  getInvoices: (req, res) => {
    const invoices = getInvoiceProductsPos(req.query);
    invoices
      .then((inv) => {
        res.status(200).send(inv);
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  },
  cancelInvoice: (req, res) => {
    const invoices = cancelInvoicePos(req.query);
    invoices
      .then((inv) => {
        res.status(200).send(inv);
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  },
  updateInvoice: (req, res) => {
    const invoices = updateInvoicePos(req.body);
    invoices
      .then((inv) => {
        res.status(200).send(inv);
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  },
  otherPayments: (req, res) => {
    const invoices = getOtherPaymentsPos();
    invoices
      .then((inv) => {
        res.status(200).send(inv);
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  },
  logIncomplete: (req, res) => {
    const invoices = logIncompleteInvoice(req.body);
    invoices
      .then((inv) => {
        res.status(200).send(inv);
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  },
};
