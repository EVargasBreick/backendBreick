const express = require("express");
const router = express.Router();
const controller = require("../controllers/user_controller");

router.get("/user/name", controller.getUserByName);
router.get("/user/id", controller.getUserById);
router.post("/user", controller.createNewUser);
router.get("/user/basic", controller.getUserBasic);
router.post("/user/changePassword", controller.changeUserPassword);
router.get('/user/find/:search', controller.getUser);
router.get('/user/all', controller.getAll);
router.put('/user/update/:userId', controller.updateUser);
module.exports = router;
