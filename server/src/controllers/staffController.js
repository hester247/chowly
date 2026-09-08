const pool = require("../db/database");

// ==========================================
// GET ALL STAFF
// ==========================================

const getStaff = async (req, res) => {
  try {
    const restaurantId = req.query.restaurant_id || 1;

    const result = await pool.query(
      `
      SELECT
        id,
        first_name,
        last_name,
        role
      FROM employees
      WHERE restaurant_id = $1
      ORDER BY role, first_name;
      `,
      [Number(restaurantId)]
    );

    const staff = {
      waiters: result.rows.filter(
        (employee) => employee.role === "waiter"
      ),

      chefs: result.rows.filter(
        (employee) => employee.role === "chef"
      ),

      bartenders: result.rows.filter(
        (employee) => employee.role === "bartender"
      ),
    };

    res.json({
      success: true,
      data: staff,
    });
  } catch (error) {
    console.error("Error fetching staff:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch staff",
    });
  }
};


// ==========================================
// ASSIGN STAFF TO ORDER
// ==========================================

const assignStaffToOrder = async (req, res) => {
  const client = await pool.connect();

  try {
    const { id } = req.params;

    const {
      chef_id = null,
      bartender_id = null,
      waiter_id = null,
    } = req.body;

    await client.query("BEGIN");

    // --------------------------------------
    // CHECK ORDER
    // --------------------------------------

    const orderResult = await client.query(
      `
      SELECT
        id,
        customer_id,
        restaurant_id,
        order_status
      FROM orders
      WHERE id = $1;
      `,
      [Number(id)]
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
    // VALIDATE CHEF
    // --------------------------------------

    if (chef_id !== null && chef_id !== "") {
      const chefResult = await client.query(
        `
        SELECT id
        FROM employees
        WHERE id = $1
          AND restaurant_id = $2
          AND role = 'chef';
        `,
        [
          Number(chef_id),
          order.restaurant_id,
        ]
      );

      if (chefResult.rows.length === 0) {
        throw new Error("Invalid chef selected");
      }
    }


    // --------------------------------------
    // VALIDATE BARTENDER
    // --------------------------------------

    if (
      bartender_id !== null &&
      bartender_id !== ""
    ) {
      const bartenderResult = await client.query(
        `
        SELECT id
        FROM employees
        WHERE id = $1
          AND restaurant_id = $2
          AND role = 'bartender';
        `,
        [
          Number(bartender_id),
          order.restaurant_id,
        ]
      );

      if (bartenderResult.rows.length === 0) {
        throw new Error(
          "Invalid bartender selected"
        );
      }
    }


    // --------------------------------------
    // VALIDATE WAITER
    // --------------------------------------

    if (waiter_id !== null && waiter_id !== "") {
      const waiterResult = await client.query(
        `
        SELECT id
        FROM employees
        WHERE id = $1
          AND restaurant_id = $2
          AND role = 'waiter';
        `,
        [
          Number(waiter_id),
          order.restaurant_id,
        ]
      );

      if (waiterResult.rows.length === 0) {
        throw new Error("Invalid waiter selected");
      }
    }


    // --------------------------------------
    // UPDATE ORDER
    // --------------------------------------

    const updatedOrderResult =
      await client.query(
        `
        UPDATE orders
        SET
          waiter_id = COALESCE($1, waiter_id),

          chef_id = COALESCE($2, chef_id),

          bartender_id = COALESCE($3, bartender_id),

          order_status = CASE
            WHEN order_status = 'pending'
            THEN 'preparing'
            ELSE order_status
          END

        WHERE id = $4

        RETURNING
          id,
          customer_id,
          restaurant_id,
          waiter_id,
          chef_id,
          bartender_id,
          order_status,
          waiting_time,
          total_amount;
        `,
        [
          waiter_id !== null &&
          waiter_id !== ""
            ? Number(waiter_id)
            : null,

          chef_id !== null &&
          chef_id !== ""
            ? Number(chef_id)
            : null,

          bartender_id !== null &&
          bartender_id !== ""
            ? Number(bartender_id)
            : null,

          Number(id),
        ]
      );


    // --------------------------------------
    // UPDATE PREPARATION RECORDS
    // --------------------------------------

    await client.query(
      `
      UPDATE order_preparations
      SET
        chef_id = COALESCE($1, chef_id),
        bartender_id = COALESCE($2, bartender_id)
      WHERE order_item_id IN (
        SELECT id
        FROM order_items
        WHERE order_id = $3
      );
      `,
      [
        chef_id !== null &&
        chef_id !== ""
          ? Number(chef_id)
          : null,

        bartender_id !== null &&
        bartender_id !== ""
          ? Number(bartender_id)
          : null,

        Number(id),
      ]
    );


    // --------------------------------------
    // RECORD PREPARING STATUS
    // --------------------------------------

    if (
      order.order_status === "pending"
    ) {
      await client.query(
        `
        INSERT INTO order_status_history
        (
          order_id,
          status
        )
        VALUES
        ($1, 'preparing');
        `,
        [Number(id)]
      );
    }


    await client.query("COMMIT");


    res.json({
      success: true,
      message: "Kitchen staff assigned successfully",
      data: updatedOrderResult.rows[0],
    });

  } catch (error) {

    await client.query("ROLLBACK");

    console.error(
      "Error assigning staff:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        error.message ||
        "Unable to assign staff",
    });

  } finally {
    client.release();
  }
};


// ==========================================
// MARK ORDER AS SERVED
// ==========================================

const markOrderServed = async (
  req,
  res
) => {
  const client = await pool.connect();

  try {
    const { id } = req.params;

    await client.query("BEGIN");


    // --------------------------------------
    // FIND ORDER
    // --------------------------------------

    const orderResult = await client.query(
      `
      SELECT
        id,
        customer_id,
        restaurant_id,
        order_status
      FROM orders
      WHERE id = $1;
      `,
      [Number(id)]
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
    // PREVENT DUPLICATE SERVING
    // --------------------------------------

    if (
      order.order_status === "served" ||
      order.order_status === "paid"
    ) {
      await client.query("ROLLBACK");

      return res.status(400).json({
        success: false,
        message: "Order has already been served",
      });
    }


    // --------------------------------------
    // UPDATE ORDER
    // --------------------------------------

    const updateResult =
      await client.query(
        `
        UPDATE orders
        SET
          order_status = 'served',
          served_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING
          id,
          customer_id,
          restaurant_id,
          waiter_id,
          chef_id,
          bartender_id,
          order_status,
          waiting_time,
          total_amount,
          served_at;
        `,
        [Number(id)]
      );


    // --------------------------------------
    // COMPLETE PREPARATION
    // --------------------------------------

    await client.query(
      `
      UPDATE order_preparations
      SET
        preparation_status = 'completed'
      WHERE order_item_id IN (
        SELECT id
        FROM order_items
        WHERE order_id = $1
      );
      `,
      [Number(id)]
    );


    // --------------------------------------
    // RECORD SERVED STATUS
    // --------------------------------------

    await client.query(
      `
      INSERT INTO order_status_history
      (
        order_id,
        status
      )
      VALUES
      ($1, 'served');
      `,
      [Number(id)]
    );


    /*
      IMPORTANT:

      We are intentionally NOT creating a
      notification here.

      Notifications are not required for the
      Chowly assignment workflow, and the
      notifications table currently has a
      customer_id constraint that was causing
      the error on the waiter dashboard.

      The important workflow is:

      Order Received
          ↓
      Preparing
          ↓
      Served
          ↓
      Payment
    */


    // --------------------------------------
    // COMMIT
    // --------------------------------------

    await client.query("COMMIT");


    res.json({
      success: true,
      message: "Order marked as served",
      data: updateResult.rows[0],
    });

  } catch (error) {

    await client.query("ROLLBACK");

    console.error(
      "Error marking order as served:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        error.message ||
        "Unable to mark order as served",
    });

  } finally {
    client.release();
  }
};


// ==========================================
// EXPORT
// ==========================================

module.exports = {
  getStaff,
  assignStaffToOrder,
  markOrderServed,
};