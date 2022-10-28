const express = require("express");
const router = express.Router();
const controller = require("../controllers/transferController");

router.post("/traspaso", controller.createTransfer);
router.get("/traspaso/lista", controller.getTransferList);
router.get("/traspaso/productos", controller.getTransferProducts);
router.put("/traspaso/actualizar", controller.updateTransfer);
module.exports = router;
