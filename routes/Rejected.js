const express = require("express");
const router = express.Router();

const controller = require("../controllers/rejected_controller");

router.post("/pedidos/rechazado", controller.logRejected);
router.get("/rechazados", controller.getRejected);
router.put("/rechazados", controller.reviseRejected);

module.exports = router;
