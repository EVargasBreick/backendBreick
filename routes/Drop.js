const express = require("express");
const router = express.Router();

const controller = require("../controllers/dropController");
router.post("/baja", controller.createDrop);
module.exports = router;
