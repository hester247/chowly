const express = require("express");

const {
  getStaff,
  assignStaffToOrder,
  markOrderServed,
} = require("../controllers/staffController");

const router = express.Router();

router.get("/", getStaff);

router.patch("/orders/:id/assign", assignStaffToOrder);

router.patch("/orders/:id/served", markOrderServed);

module.exports = router;