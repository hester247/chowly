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
        mi.item_type,
        mi.price,
        mi.preparation_time,
        mi.availability_status,
        r.name AS restaurant_name
      FROM menu_items mi
      JOIN restaurants r
        ON mi.restaurant_id = r.id
      WHERE mi.restaurant_id = $1
        AND mi.availability_status = 'available'
      ORDER BY mi.item_type, mi.name;
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
    });
  }
};

module.exports = {
  getMenu,
};