const express = require("express");
const router = express.Router();

const controller = require("../controllers/drop_controller");
router.post("/baja", controller.createDrop);
router.put("/baja/anular", controller.cancelDrop);
router.get("/baja/info", controller.dropInfo);
module.exports = router;
