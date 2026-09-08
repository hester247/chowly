const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const menuRoutes = require("./routes/menuRoutes");
const staffRoutes = require("./routes/staffRoutes");
const orderRoutes = require("./routes/orderRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Chowly API is running",
  });
});

app.use("/api/menu", menuRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/payments", paymentRoutes);

const PORT = process.env.PORT || 3001;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Chowly server running on port ${PORT}`);
});