const pool = require("../db/database");

// ==========================================
// CREATE COMPLAINT
// ==========================================

const createComplaint = async (req, res) => {
  const {
    order_id,
    complaint_description,
  } = req.body;

  if (!order_id || !complaint_description?.trim()) {
    return res.status(400).json({
      success: false,
      message:
        "Order ID and complaint description are required",
    });
  }

  try {
    // Get the customer belonging to the order
    const orderResult = await pool.query(
      `
      SELECT
        id,
        customer_id
      FROM orders
      WHERE id = $1
      `,
      [Number(order_id)]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const order = orderResult.rows[0];

    if (!order.customer_id) {
      return res.status(400).json({
        success: false,
        message:
          "This order has no customer assigned",
      });
    }

    // Save complaint
    const result = await pool.query(
      `
      INSERT INTO complaints (
        order_id,
        customer_id,
        description,
        status
      )
      VALUES (
        $1,
        $2,
        $3,
        'submitted'
      )
      RETURNING
        id,
        order_id,
        customer_id,
        description,
        complaint_date,
        complaint_time,
        status;
      `,
      [
        order.id,
        order.customer_id,
        complaint_description.trim(),
      ]
    );

    res.status(201).json({
      success: true,
      message:
        "Your complaint has been submitted successfully.",
      data: result.rows[0],
    });

  } catch (error) {
    console.error(
      "Complaint error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        error.message ||
        "Unable to submit complaint",
    });
  }
};


// ==========================================
// CREATE RATING
// ==========================================

const createRating = async (req, res) => {
  const {
    order_id,
    score,
    rating_comment,
  } = req.body;

  if (!order_id) {
    return res.status(400).json({
      success: false,
      message: "Order ID is required",
    });
  }

  const ratingScore = Number(score);

  if (
    !Number.isInteger(ratingScore) ||
    ratingScore < 1 ||
    ratingScore > 5
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Rating score must be between 1 and 5",
    });
  }

  try {
    // Get the customer belonging to the order
    const orderResult = await pool.query(
      `
      SELECT
        id,
        customer_id
      FROM orders
      WHERE id = $1
      `,
      [Number(order_id)]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const order = orderResult.rows[0];

    if (!order.customer_id) {
      return res.status(400).json({
        success: false,
        message:
          "This order has no customer assigned",
      });
    }

    // Save rating
    const result = await pool.query(
      `
      INSERT INTO ratings (
        order_id,
        customer_id,
        score,
        comment
      )
      VALUES (
        $1,
        $2,
        $3,
        $4
      )
      RETURNING
        id,
        order_id,
        customer_id,
        score,
        comment,
        rating_date;
      `,
      [
        order.id,
        order.customer_id,
        ratingScore,
        rating_comment?.trim() || null,
      ]
    );

    res.status(201).json({
      success: true,
      message:
        "Thank you. Your rating has been submitted successfully.",
      data: result.rows[0],
    });

  } catch (error) {
    console.error(
      "Rating error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        error.message ||
        "Unable to submit rating",
    });
  }
};


// ==========================================
// EXPORT
// ==========================================

module.exports = {
  createComplaint,
  createRating,
};