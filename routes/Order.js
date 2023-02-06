const express = require("express");
const router = express.Router();

const controller = require("../controllers/orderController");

router.post("/pedidos", controller.createNewOrder);
router.get("/pedidos/estado", controller.getOrderStatus);
router.get("/pedidos/lista", controller.getOrderList);
router.get("/pedidos/lista/usuario", controller.getUserOrderList);
router.get("/pedidos/detalle", controller.getOrderDetail);
router.get("/pedidos/tipo", controller.getOrderType);
router.put("/pedidos/aprobar", controller.approveOrder);
router.get("/pedidos/productos", controller.orderProdList);
router.delete("/pedidos", controller.deleteOrder);
router.put("/pedidos/cancelar", controller.cancelOrder);
router.post("/pedidos/productos/agregar", controller.addProductToOrder);
router.put("/pedidos/productos/actualizar", controller.updateProductInOrder);
router.put("/pedidos/actualizar", controller.updateOrder);
router.put("/pedidos/productos/borrar", controller.deleteProductOrder);
router.get("/pedidos/lista/facturar", controller.ordersToInvoice);
router.get("/pedidos/detalles/facturar", controller.orderToInvoiceDetails);
router.put("/pedidos/actualizar/facturar", controller.invoiceOrder);
router.get("/pedidos/imprimir", controller.notPrinted);
router.put("/pedidos/imprimir", controller.orderPrinted);
router.get("/pedidos/alistar", controller.orderToReady);
router.get("/pedidos/reimprimir", controller.toRePrint);
router.put("/pedidos/alistar", controller.changeReady);
module.exports = router;
