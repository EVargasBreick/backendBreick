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
router.post("/traspaso/productos", controller.addProduct);
router.delete("/traspaso/productos", controller.deleteProduct);
router.put("/traspaso/productos", controller.updateProduct);
router.put("/traspaso", controller.updateChangedTransfer);
module.exports = router;
