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
  updateTheClientMail,
  getClientSimple,
} = require("../models/client_model");
const sessionParams = require("../server");
const session = require("express-session");
const app = express();
app.use(session(sessionParams));
module.exports = {
  createNewClient: (req, res) => {
    console.log("Body en controller:", req.body);
    const promise = registerClientPos(req.body);
    promise
      .then((data) => {
        response = JSON.parse(data);
        console.log(data);
        res.status(response.code).send(response);
      })
      .catch((err) => {
        console.log(err);
        res.status(500).send(err);
      });
  },
  createNewClientPos: (req, res) => {
    const promise = registerClientPos(req.body);
    promise
      .then((data) => {
        response = JSON.parse(data);
        console.log(data);
        res.status(response.code).send(response);
      })
      .catch((err) => {
        console.log(err);
        res.status(500).send(err);
      });
  },
  getClient: (req, res) => {
    const promise = getClientsPos(req.query);
    promise
      .then((data) => {
        response = JSON.parse(data);
        console.log(data);
        res.status(response.code).send(response);
      })
      .catch((err) => {
        console.log(err);
        res.status(500).send(err);
      });
  },
  getClientById: (req, res) => {
    const promise = getClientByIdPos(req.query);
    promise
      .then((data) => {
        response = JSON.parse(data);
        console.log(data);
        res.status(response.code).send(response);
      })
      .catch((err) => {
        console.log(err);
        res.status(500).send(err);
      });
  },
  getFullClient: (req, res) => {
    const promise = getFullClientPos(req.query);
    promise
      .then((data) => {
        response = JSON.parse(data);
        console.log(data);
        res.status(response.code).send(response);
      })
      .catch((err) => {
        console.log(err);
        res.status(500).send(err);
      });
  },
  updateClient: (req, res) => {
    console.log("Body en controller:", req.body);
    const promise = updateClientPos(req.body, req.query);
    promise
      .then((data) => {
        response = JSON.parse(data);
        console.log(data);
        res.status(response.code).send(response);
      })
      .catch((err) => {
        console.log(err);
        res.status(500).send(err);
      });
  },
  getNumberClients: (req, res) => {
    const clients = getNumberOfClientsPos();
    clients
      .then((response) => {
        var resp = JSON.parse(response);
        res.status(resp.code).send(resp);
      })
      .catch((err) => {
        console.log(err);
        res.status(500).send(err);
      });
  },
  updateClientMail: (req, res) => {
    console.log("Body en controller:", req.body);
    const promise = updateTheClientMail(req.body);
    promise
      .then((data) => {
        response = JSON.parse(data);
        console.log(data);
        res.status(response.code).send(response);
      })
      .catch((err) => {
        const error = JSON.parse(err);
        res.status(error.code).send(error.data);
      });
  },
  getClientSimple: async (req, res) => {
    console.log("REQ", req.query);
    const { value } = req.query;
    try {
      const response = await getClientSimple(value);
      res.status(200).send(response);
    } catch (err) {
      res.satus(500).send(err);
    }
  },
};
