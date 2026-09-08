const express = require("express");

const {
  createPayment,
  getPaymentByOrder,
} = require("../controllers/paymentController");

const router = express.Router();

// ==========================================
// CREATE PAYMENT
// ==========================================

router.post("/", createPayment);

// ==========================================
// GET PAYMENT FOR AN ORDER
// ==========================================

router.get(
  "/order/:orderId",
  getPaymentByOrder
);

module.exports = router;