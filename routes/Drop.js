const express = require("express");
const router = express.Router();

const controller = require("../controllers/drop_controller");
router.post("/baja", controller.createDrop);
module.exports = router;
