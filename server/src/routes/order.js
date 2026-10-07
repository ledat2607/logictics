// src/routes/orders.js
const express = require("express");
const router = express.Router();
const orderController = require("../controllers/order-controllers");

// 1. Tính cước phí
router.post("/calculate-fee", orderController.calculateFee);

// 2. Tạo đơn hàng
router.post("/", orderController.createOrder);

// 3. Tra cứu đơn hàng công khai
router.get("/tracking/:code", orderController.getTracking);

// 4. Cập nhật trạng thái đơn hàng
router.patch("/:id/status", orderController.updateOrderStatus);

module.exports = router;