const pool = require("../db/database");

// ==========================================
// CREATE PRETEND PAYMENT
// ==========================================

const createPayment = async (req, res) => {
  const { order_id, payment_method } = req.body;

  if (!order_id || !payment_method) {
    return res.status(400).json({
      success: false,
      message: "Order ID and payment method are required",
    });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // --------------------------------------
    // GET ORDER
    // --------------------------------------

    const orderResult = await client.query(
      `
      SELECT
        id,
        customer_id,
        restaurant_id,
        total_amount,
        order_status
      FROM orders
      WHERE id = $1
      `,
      [Number(order_id)]
    );

    if (orderResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const order = orderResult.rows[0];

    // --------------------------------------
    // PREVENT DOUBLE PAYMENT
    // --------------------------------------

    if (order.order_status === "paid") {
      await client.query("ROLLBACK");

      return res.status(400).json({
        success: false,
        message: "This order has already been paid for",
      });
    }

    // --------------------------------------
    // PAYMENT ONLY AFTER SERVED
    // --------------------------------------

    if (order.order_status !== "served") {
      await client.query("ROLLBACK");

      return res.status(400).json({
        success: false,
        message:
          "Payment is available after the order has been served",
      });
    }

    // --------------------------------------
    // RECORD PRETEND PAYMENT
    // --------------------------------------

    const paymentResult = await client.query(
      `
      INSERT INTO payments (
        order_id,
        amount,
        payment_method,
        payment_status,
        is_demo
      )
      VALUES (
        $1,
        $2,
        $3,
        'successful',
        TRUE
      )
      RETURNING
        id,
        order_id,
        amount,
        payment_method,
        payment_status,
        is_demo
      `,
      [
        order.id,
        order.total_amount,
        payment_method,
      ]
    );

    const payment = paymentResult.rows[0];

    // --------------------------------------
    // MARK ORDER AS PAID
    // --------------------------------------

    await client.query(
      `
      UPDATE orders
      SET
        order_status = 'paid',
        paid_at = CURRENT_TIMESTAMP
      WHERE id = $1
      `,
      [order.id]
    );

    // --------------------------------------
    // RECORD PAID STATUS
    // --------------------------------------

    await client.query(
      `
      INSERT INTO order_status_history (
        order_id,
        status
      )
      VALUES (
        $1,
        'paid'
      )
      `,
      [order.id]
    );

    // --------------------------------------
    // COMMIT
    // --------------------------------------

    await client.query("COMMIT");

    // --------------------------------------
    // SUCCESS RESPONSE
    // --------------------------------------

    res.status(201).json({
      success: true,
      message:
        "Pretend payment completed successfully",
      data: {
        payment,
        order: {
          id: order.id,
          customer_id: order.customer_id,
          order_status: "paid",
          total_amount: order.total_amount,
        },
      },
    });

  } catch (error) {
    await client.query("ROLLBACK");

    console.error(
      "Payment error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });

  } finally {
    client.release();
  }
};


// ==========================================
// GET PAYMENT BY ORDER
// ==========================================

const getPaymentByOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const result = await pool.query(
      `
      SELECT
        id,
        order_id,
        amount,
        payment_method,
        payment_status,
        is_demo
      FROM payments
      WHERE order_id = $1
      `,
      [Number(orderId)]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });

  } catch (error) {
    console.error(
      "Error fetching payment:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Unable to fetch payment",
    });
  }
};


// ==========================================
// EXPORT
// ==========================================

module.exports = {
  createPayment,
  getPaymentByOrder,
};