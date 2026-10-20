const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "logistix_super_secret_key_2026";

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // 💡 CHẶN: Không có header, không bắt đầu bằng Bearer, hoặc token là chuỗi "null"/"undefined"
  if (
    !authHeader ||
    !authHeader.startsWith("Bearer ") ||
    authHeader.includes("null") ||
    authHeader.includes("undefined")
  ) {
    return res.status(401).json({
      success: false,
      error:
        "Bạn chưa đăng nhập! Vui lòng đăng nhập để thực hiện chức năng này.",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    return next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      error: "Token không hợp lệ hoặc đã hết hạn!",
    });
  }
};
