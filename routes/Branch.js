const express = require("express");
const router = express.Router();

const controller = require("../controllers/branchController");

router.get("/sucursales", controller.getBranches);
module.exports = router;
