const express = require("express");
const router = express.Router();

const controller = require("../controllers/rolController");

router.get("/roles", controller.getRoles);
module.exports = router;
