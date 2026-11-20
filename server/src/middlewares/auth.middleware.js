const jwt = require("jsonwebtoken");

const ACCESS_TOKEN_SECRET =
  process.env.ACCESS_TOKEN_SECRET ||
  process.env.JWT_SECRET ||
  "logistix_super_secret_key_2026";

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (
    !authHeader ||
    !authHeader.startsWith("Bearer ") ||
    authHeader.includes("null") ||
    authHeader.includes("undefined")
  ) {
    return res.status(401).json({
      success: false,
      code: "MISSING_TOKEN",
      error:
        "Bạn chưa đăng nhập! Vui lòng đăng nhập để thực hiện chức năng này.",
    });
  }

  const token = authHeader.split(" ")[1]?.trim();

  if (!token) {
    return res.status(401).json({
      success: false,
      code: "MISSING_TOKEN",
      error:
        "Bạn chưa đăng nhập! Vui lòng đăng nhập để thực hiện chức năng này.",
    });
  }

  try {
    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);
    req.user = decoded;
    return next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        code: "TOKEN_EXPIRED",
        error: "Access Token đã hết hạn!",
      });
    }

    return res.status(401).json({
      success: false,
      code: "INVALID_TOKEN",
      error: "Access Token không hợp lệ!",
    });
  }
};
