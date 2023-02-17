const express = require("express");
const sessionParams = require("../server");
const session = require("express-session");
const {
  registerContact,
  getMainContact,
  updateContact,
  registerContactPos,
  updateContactPos,
  getMainContactPos,
} = require("../models/ContactsModel");
const app = express();
app.use(session(sessionParams));
module.exports = {
  createNewContact: (req, res) => {
    console.log("Body en controller:", req.body);
    const promise = registerContactPos(req.body);
    promise.then((data) => {
      response = JSON.parse(data);
      console.log(data);
      res.status(response.code).send(response);
    });
  },
  updateContact: (req, res) => {
    console.log("Body en controller:", req.body);
    const promise = updateContactPos(req.body, req.query);
    promise.then((data) => {
      response = JSON.parse(data);
      console.log(data);
      res.status(response.code).send(response);
    });
  },
  getContactsByUser: (req, res) => {
    const promise = getMainContactPos(req.query);
    promise.then((data) => {
      response = JSON.parse(data);
      console.log(data);
      res.status(response.code).send(response);
    });
  },
};
