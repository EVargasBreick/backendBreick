const express = require("express");
const sessionParams = require("../server");
const session = require("express-session");
const {
  registerContact,
  getMainContact,
  updateContact,
} = require("../models/ContactsModel");
const app = express();
app.use(session(sessionParams));
module.exports = {
  createNewContact: (req, res) => {
    console.log("Body en controller:", req.body);
    const promise = registerContact(req.body);
    promise.then((data) => {
      response = JSON.parse(data);
      console.log(data);
      res.status(response.code).send(response);
    });
  },
  updateContact: (req, res) => {
    console.log("Body en controller:", req.body);
    const promise = updateContact(req.body, req.query);
    promise.then((data) => {
      response = JSON.parse(data);
      console.log(data);
      res.status(response.code).send(response);
    });
  },
  getContactsByUser: (req, res) => {
    const promise = getMainContact(req.query);
    promise.then((data) => {
      response = JSON.parse(data);
      console.log(data);
      res.status(response.code).send(response);
    });
  },
};
