const express = require("express");

const {
  createComplaint,
  createRating,
} = require("../controllers/feedbackController");

const router = express.Router();

router.post("/complaints", createComplaint);

router.post("/ratings", createRating);

module.exports = router;