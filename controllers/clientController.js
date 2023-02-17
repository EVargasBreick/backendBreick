const express = require("express");
const {
  registerClient,
  getClients,
  getClientById,
  getFullClient,
  updateClient,
  getNumberOfClients,
  registerClientPos,
  updateClientPos,
  getNumberOfClientsPos,
  getClientsPos,
  getClientByIdPos,
  getFullClientPos,
} = require("../models/ClientModel");
const sessionParams = require("../server");
const session = require("express-session");
const app = express();
app.use(session(sessionParams));
module.exports = {
  createNewClient: (req, res) => {
    console.log("Body en controller:", req.body);
    const promise = registerClient(req.body);
    promise.then((data) => {
      response = JSON.parse(data);
      console.log(data);
      res.status(response.code).send(response);
    });
  },
  createNewClientPos: (req, res) => {
    const promise = registerClientPos(req.body);
    promise.then((data) => {
      response = JSON.parse(data);
      console.log(data);
      res.status(response.code).send(response);
    });
  },
  getClient: (req, res) => {
    const promise = getClientsPos(req.query);
    promise.then((data) => {
      response = JSON.parse(data);
      console.log(data);
      res.status(response.code).send(response);
    });
  },
  getClientById: (req, res) => {
    const promise = getClientByIdPos(req.query);
    promise.then((data) => {
      response = JSON.parse(data);
      console.log(data);
      res.status(response.code).send(response);
    });
  },
  getFullClient: (req, res) => {
    const promise = getFullClientPos(req.query);
    promise.then((data) => {
      response = JSON.parse(data);
      console.log(data);
      res.status(response.code).send(response);
    });
  },
  updateClient: (req, res) => {
    console.log("Body en controller:", req.body);
    const promise = updateClientPos(req.body, req.query);
    promise.then((data) => {
      response = JSON.parse(data);
      console.log(data);
      res.status(response.code).send(response);
    });
  },
  getNumberClients: (req, res) => {
    const clients = getNumberOfClientsPos();
    clients.then((response) => {
      var resp = JSON.parse(response);
      res.status(resp.code).send(resp);
    });
  },
};
