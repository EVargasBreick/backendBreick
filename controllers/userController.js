const express = require("express");
const router = express.Router();

const {
  findUserByName,
  findUserById,
  createNewUser,
} = require("../models/UserModel");
let datos;
let response;
module.exports = {
  getUserByName: (req, res) => {
    const promise = findUserByName(req.query.name);
    console.log("paramssss ", req.query.name);
    promise.then((data) => {
      response = JSON.parse(data);
      console.log("Respuesta", response.data);
      res.status(response.code).send(response.data);
    });
  },
  getUserById: (req, res) => {
    const promise = findUserById(req.query.id);
    console.log("paramssss ", req.query.id);
    promise.then((data) => {
      response = JSON.parse(data);
      console.log("Respuesta", response.data);
      res.status(response.code).send(response.data);
    });
  },
  createNewUser: (req, res) => {
    console.log("Body en controller:", req.body);
    const promise = createNewUser(req.body);
    promise.then((data) => {
      response = JSON.parse(data);
      console.log(data);
      res.status(response.code).send(response);
    });
  },
};
