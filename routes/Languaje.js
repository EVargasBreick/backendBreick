const express = require("express");
const router = express.Router();

const controller = require("../controllers/languajeController");
router.get("/language", controller.getLanguajes);
module.exports = router;
