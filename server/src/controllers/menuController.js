const pool = require("../db/database");

const getMenu = async (req, res) => {
  try {
    const restaurantId = req.query.restaurant_id || 1;

    const result = await pool.query(
      `
      SELECT
        mi.id,
        mi.name,
        mi.description,
        mi.price,
        mi.preparation_time,
        mi.availability_status,

        CASE
          WHEN m.menu_type = 'food' THEN 'Food'
          WHEN m.menu_type = 'drinks' THEN 'Drink'
          ELSE 'Food and Drinks'
        END AS item_type,

        r.name AS restaurant_name

      FROM menu_items mi

      JOIN menus m
        ON mi.menu_id = m.id

      JOIN restaurants r
        ON m.restaurant_id = r.id

      WHERE m.restaurant_id = $1
        AND mi.availability_status = 'available'

      ORDER BY m.menu_type, mi.name;
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