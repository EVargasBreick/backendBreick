const express = require("express");
const sessionParams = require("../server");
const session = require("express-session");
const { getBranches, getBranchesPostgres } = require("../models/branch_model");

const app = express();

app.use(session(sessionParams));

module.exports = {
  getBranches: (req, res) => {
    const roles = getBranches();
    roles.then((rol) => {
      res.status(200).send(JSON.parse(rol));
    });
  },
  getBranchesPos: (req, res) => {
    const roles = getBranchesPostgres();
    roles.then((rol) => {
      res.status(200).send(JSON.parse(rol));
    });
  },
};
