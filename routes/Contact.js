const express = require("express");
const router = express.Router();
const controller = require("../controllers/contact_controller");

router.post("/contact", controller.createNewContact);
router.get("/contact", controller.getContactsByUser);
router.put("/contact", controller.updateContact);

module.exports = router;
