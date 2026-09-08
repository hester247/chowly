const pool = require("../db/database");

const getMenu = async (req, res) => {
  try {
    const restaurantId = req.query.restaurant_id || 1;

    const result = await pool.query(
      `
      SELECT
        id,
        restaurant_id,
        name,
        item_type,
        description,
        price,
        preparation_time,
        availability_status,
        created_at
      FROM menu_items
      WHERE restaurant_id = $1
        AND availability_status = 'available'
      ORDER BY item_type, name;
      `,
      [restaurantId]
    );

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error("Error fetching menu:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch menu",
      error: error.message,
    });
  }
};

module.exports = {
  getMenu,
};