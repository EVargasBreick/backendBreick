const express = require("express");
const sessionParams = require("../server");
const session = require("express-session");
const getBranches = require("../models/branchModel");

const app = express();

app.use(session(sessionParams));

module.exports = {
  getBranches: (req, res) => {
    const roles = getBranches();
    roles.then((rol) => {
      res.status(200).send(JSON.parse(rol));
    });
  },
};
