const { Router } = require("express");
const orderCtrl = require("./orderController");

const orderRouter = Router();

orderRouter.get("/orders",  orderCtrl.getAllOrders);
orderRouter.get("/orders/:username", orderCtrl.getOrdersByUsername);
orderRouter.post("/orders", orderCtrl.addNewOrder);

module.exports = orderRouter;

