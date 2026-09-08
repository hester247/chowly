const pool = require("../db/database");

const createOrder = async (req, res) => {
  const client = await pool.connect();

  try {
    const {
      customer_id,
      restaurant_id = 1,
      items,
    } = req.body;

    // Validate customer
    if (!customer_id) {
      return res.status(400).json({
        success: false,
        message: "customer_id is required",
      });
    }

    // Validate items
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one order item is required",
      });
    }

    await client.query("BEGIN");

    let totalAmount = 0;
    let waitingTime = 0;

    const validatedItems = [];

    // Validate every menu item
    for (const item of items) {
      const menuItemResult = await client.query(
        `
        SELECT
          id,
          name,
          price,
          preparation_time,
          availability_status
        FROM menu_items
        WHERE id = $1
        `,
        [item.menu_item_id]
      );

      if (menuItemResult.rows.length === 0) {
        throw new Error(
          `Menu item ${item.menu_item_id} does not exist`
        );
      }

      const menuItem = menuItemResult.rows[0];

      // Check availability
      if (menuItem.availability_status !== "available") {
        throw new Error(
          `${menuItem.name} is currently unavailable`
        );
      }

      const quantity = Number(item.quantity);

      // Check quantity
      if (!Number.isInteger(quantity) || quantity <= 0) {
        throw new Error(
          `Invalid quantity for ${menuItem.name}`
        );
      }

      const unitPrice = Number(menuItem.price);

      const subtotal = unitPrice * quantity;

      totalAmount += subtotal;

      // Use the longest preparation time
      waitingTime = Math.max(
        waitingTime,
        Number(menuItem.preparation_time)
      );

      validatedItems.push({
        menu_item_id: menuItem.id,
        quantity,
        unit_price: unitPrice,
        subtotal,
      });
    }

    // Create the order
    const orderResult = await client.query(
      `
      INSERT INTO orders
      (
        customer_id,
        restaurant_id,
        order_status,
        waiting_time,
        total_amount
      )
      VALUES
      ($1, $2, 'pending', $3, $4)
      RETURNING *;
      `,
      [
        customer_id,
        restaurant_id,
        waitingTime,
        totalAmount,
      ]
    );

    const order = orderResult.rows[0];

    // Create order items and preparation records
    for (const item of validatedItems) {
      const orderItemResult = await client.query(
        `
        INSERT INTO order_items
        (
          order_id,
          menu_item_id,
          quantity,
          unit_price,
          subtotal
        )
        VALUES
        ($1, $2, $3, $4, $5)
        RETURNING id;
        `,
        [
          order.id,
          item.menu_item_id,
          item.quantity,
          item.unit_price,
          item.subtotal,
        ]
      );

      const orderItemId =
        orderItemResult.rows[0].id;

      await client.query(
        `
        INSERT INTO order_preparations
        (
          order_item_id,
          preparation_status
        )
        VALUES
        ($1, 'preparing');
        `,
        [orderItemId]
      );
    }

    // Record initial order status
    await client.query(
      `
      INSERT INTO order_status_history
      (
        order_id,
        status
      )
      VALUES
      ($1, 'pending');
      `,
      [order.id]
    );

    // Create notification
    await client.query(
      `
      INSERT INTO notifications
      (
        customer_id,
        order_id,
        message,
        notification_type
      )
      VALUES
      (
        $1,
        $2,
        $3,
        'order_created'
      );
      `,
      [
        customer_id,
        order.id,
        `Your order #${order.id} has been received.`,
      ]
    );

    await client.query("COMMIT");

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      data: {
        order_id: order.id,
        customer_id: order.customer_id,
        restaurant_id: order.restaurant_id,
        order_status: order.order_status,
        waiting_time: order.waiting_time,
        total_amount: order.total_amount,
      },
    });

  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Error creating order:", error);

    res.status(500).json({
      success: false,
      message: error.message || "Unable to create order",
    });

  } finally {
    client.release();
  }
};

const getOrders = async (req, res) => {
  try {
    const restaurantId = req.query.restaurant_id || 1;

    const result = await pool.query(
      `
      SELECT
        o.id,
        o.customer_id,
        o.restaurant_id,
        o.waiter_id,
        o.order_date,
        o.order_status,
        o.waiting_time,
        o.total_amount,
        o.served_at,
        o.paid_at,
        c.first_name AS customer_first_name,
        c.last_name AS customer_last_name
      FROM orders o
      JOIN customers c
        ON o.customer_id = c.id
      WHERE o.restaurant_id = $1
      ORDER BY o.order_date DESC;
      `,
      [restaurantId]
    );

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch orders",
    });
  }
};


const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const orderResult = await pool.query(
      `
      SELECT
        o.id,
        o.customer_id,
        o.restaurant_id,
        o.waiter_id,
        o.order_date,
        o.order_status,
        o.waiting_time,
        o.total_amount,
        o.served_at,
        o.paid_at,
        c.first_name AS customer_first_name,
        c.last_name AS customer_last_name
      FROM orders o
      JOIN customers c
        ON o.customer_id = c.id
      WHERE o.id = $1;
      `,
      [id]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const order = orderResult.rows[0];

    const itemsResult = await pool.query(
      `
      SELECT
        oi.id,
        oi.menu_item_id,
        mi.name,
        mi.description,
        oi.quantity,
        oi.unit_price,
        oi.subtotal,
        mi.preparation_time
      FROM order_items oi
      JOIN menu_items mi
        ON oi.menu_item_id = mi.id
      WHERE oi.order_id = $1
      ORDER BY oi.id;
      `,
      [id]
    );

    const historyResult = await pool.query(
      `
      SELECT
        id,
        status,
        changed_at
      FROM order_status_history
      WHERE order_id = $1
      ORDER BY changed_at ASC;
      `,
      [id]
    );

    res.json({
      success: true,
      data: {
        order,
        items: itemsResult.rows,
        status_history: historyResult.rows,
      },
    });
  } catch (error) {
    console.error("Error fetching order:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch order",
    });
  }
};


module.exports = {
  createOrder,
  getOrders,
  getOrderById,
};