const express = require("express");
const router = express.Router();
const controller = require("../controllers/transferController");

router.post("/traspaso", controller.createTransfer);
router.get("/traspaso/lista", controller.getTransferList);
router.get("/traspaso/productos", controller.getTransferProducts);
router.put("/traspaso/actualizar", controller.updateTransfer);
router.put("/traspaso/imprimir", controller.transferPrinted);
router.get("/traspaso/reimprimir", controller.toRePrint);
router.put("/traspaso/alistar", controller.changeReady);
module.exports = router;
