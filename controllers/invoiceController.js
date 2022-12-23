const express = require("express");
const sessionParams = require("../server");
const session = require("express-session");
const { createInvoice, deleteInvoice } = require("../models/InvoiceModel");
const app = express();
app.use(session(sessionParams));

module.exports = {
  createNewInvoice: (req, res) => {
    const promise = createInvoice(req.body);
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
    const deleted = deleteInvoice(req.query.id);
    deleted
      .then((del) => {
        res.status(200).send(del);
      })
      .catch((err) => {
        res.status(400).send(err);
      });
  },
};
