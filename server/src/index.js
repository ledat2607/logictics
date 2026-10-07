const express = require("express");
const cors = require("cors");
const db = require("./config/db");

//routes
const orderRoutes = require("./routes/order");

const PORT = process.env.PORT || 3000;
const app = express();

app.use(
  cors({
    origin: ["http://localhost:3000", "https://logictics-eight.vercel.app/"],
    credentials: true,
  }),
);
app.use(express.json());

db.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.error("❌ Error connecting to PostgreSQL Database:", err);
  } else {
    console.log("✅ PostgreSQL Database connection successful:", res.rows[0]);
  }
});

app.get("/", (req, res) => {
  res.send({ status: "OK", message: "Logistics API Service is running" });
});

//api

app.use("/api/orders", orderRoutes);

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});
