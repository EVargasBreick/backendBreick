const express = require("express");
const router = express.Router();

const {
  findUserByName,
  findUserById,
  createNewUser,
  findUserBasic,
  findUserByNamePos,
  findUserByIdPos,
  createNewUserPos,
  findUserBasicPos,
  changePassword,
} = require("../models/user_model.js");
let datos;
let response;
module.exports = {
  getUserByName: (req, res) => {
    const promise = findUserByNamePos(req.query.name);
    console.log("paramssss ", req.query.name);
    promise.then((data) => {
      response = JSON.parse(data);
      console.log("Respuesta", response.data);
      res.status(response.code).send(response.data);
    });
  },
  getUserById: (req, res) => {
    const promise = findUserByIdPos(req.query.id);
    console.log("paramssss ", req.query.id);
    promise.then((data) => {
      response = JSON.parse(data);
      console.log("Respuesta", response.data);
      res.status(response.code).send(response.data);
    });
  },
  createNewUser: (req, res) => {
    console.log("Body en controller:", req.body);
    const promise = createNewUserPos(req.body);
    promise.then((data) => {
      response = JSON.parse(data);
      console.log(data);
      res.status(response.code).send(response);
    });
  },
  getUserBasic: (req, res) => {
    const promise = findUserBasicPos();
    promise.then((data) => {
      response = JSON.parse(data);
      res.status(response.code).send(response.data);
    });
  },
  changeUserPassword: async (req, res) => {
    try {
      const updated = await changePassword(req.body);
      res.status(200).json(updated);
    } catch (err) {
      res.status(500).json({ error: err || 'No se pudo actualizar la contraseña.' });
    }
  }
};
