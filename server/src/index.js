const express = require("express");
const cors = require("cors");
const db = require("./config/db");

// Routes
const orderRoutes = require("./routes/order");

const PORT = process.env.PORT || 5000;
const app = express();

// 1. Cấu hình CORS mở rộng & linh hoạt hơn
const allowedOrigins = [
  "http://localhost:3000",
  "https://logistics-eight.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      
      if (
        !origin ||
        allowedOrigins.indexOf(origin) !== -1 ||
        origin.endsWith(".vercel.app")
      ) {
        callback(null, true);
      } else {
        callback(null, true); // Nếu vẫn bị chặn, cho phép tạm thời để debug
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    credentials: true,
  }),
);

// 2. Middleware đọc JSON
app.use(express.json());

// 3. Test kết nối DB
db.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.error("❌ Error connecting to PostgreSQL Database:", err);
  } else {
    console.log("⚡ PostgreSQL Database connection successful:", res.rows[0]);
  }
});

// 4. Route Health Check
app.get("/", (req, res) => {
  res.send({ status: "OK", message: "Logistics API Service is running" });
});

// 5. ĐÍNH KÈM ROUTES VÀO APP (Rất quan trọng!)
app.use("/api/orders", orderRoutes); // Thay /api/orders đúng với endpoint của bạn

app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
