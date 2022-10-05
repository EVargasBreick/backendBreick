const express = require("express");
const router = express.Router();

const controller = require("../controllers/dayController");
router.get("/dias", controller.getDias);
module.exports = router;
