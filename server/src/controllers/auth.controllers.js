const jwt = require("jsonwebtoken");
const db = require("../config/db");
const bcrypt = require("bcryptjs");

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;

const {
  getRefreshTokenExpiryDate,
  hashToken,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require("../utils/token");

const setRefreshTokenCookie = (res, refreshToken) => {
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    path: "/",
  });
};

exports.register = async (req, res) => {
  try {
    const { full_name, email, phone, password, role = "CUSTOMER" } = req.body;

    if (!full_name || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        error: "Vui lòng nhập đầy đủ Họ tên, Email, Số điện thoại và Mật khẩu!",
      });
    }

    const cleanPhone = phone.trim().replace(/\s+/g, "");
    const vnPhoneRegex = /^(03|05|07|08|09)+[0-9]{8}$/;

    if (!vnPhoneRegex.test(cleanPhone)) {
      return res.status(400).json({
        success: false,
        error:
          "Số điện thoại không hợp lệ! Vui lòng nhập số điện thoại Việt Nam gồm 10 chữ số (ví dụ: 0987654321).",
      });
    }

    const checkDuplicateQuery = `
      SELECT id, email, phone FROM users 
      WHERE email = $1 OR phone = $2;
    `;
    const existingUsers = await db.query(checkDuplicateQuery, [
      email.toLowerCase().trim(),
      cleanPhone,
    ]);

    if (existingUsers.rows.length > 0) {
      const match = existingUsers.rows[0];
      if (match.email === email.toLowerCase().trim()) {
        return res.status(400).json({
          success: false,
          error: "Email này đã được đăng ký sử dụng!",
        });
      }
      if (match.phone === cleanPhone) {
        return res.status(400).json({
          success: false,
          error: "Số điện thoại này đã được đăng ký sử dụng!",
        });
      }
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const insertQuery = `
  INSERT INTO users (full_name, email, phone, password_hash, status, created_at)
  VALUES ($1, $2, $3, $4, $5, NOW())
  RETURNING id, full_name, email, phone, status, created_at;
`;

    const values = [
      full_name.trim(),
      email.toLowerCase().trim(),
      cleanPhone,
      passwordHash,
      "active",
    ];
    const { rows } = await db.query(insertQuery, values);
    const newUser = rows[0];

    // 6. Tạo JWT Token
    const token = jwt.sign(
      { userId: newUser.id, role: newUser.role, email: newUser.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN || "7d" },
    );

    console.log("👤 Đăng ký người dùng mới thành công:", newUser.email);

    return res.status(201).json({
      success: true,
      message: "Đăng ký tài khoản thành công!",
      token,
      user: newUser,
    });
  } catch (error) {
    console.error("Lỗi Register:", error);
    return res
      .status(500)
      .json({ success: false, error: "Lỗi hệ thống khi đăng ký!" });
  }
};

exports.login = async (req, res) => {
  try {
    const identifier =
      req.body.account_identifier || req.body.email || req.body.phone;
    const { password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        error: "Vui lòng nhập đầy đủ Email/SĐT và Mật khẩu!",
      });
    }

    // Tìm user theo email hoặc phone và trạng thái active
    const userQuery = await db.query(
      "SELECT * FROM users WHERE (email = $1 OR phone = $1) AND status = 'active'",
      [identifier],
    );

    const { rows } = userQuery;

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: "Email/SĐT hoặc mật khẩu không chính xác!",
      });
    }

    const user = rows[0];

    // So sánh mật khẩu băm với cột password_hash
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: "Email/SĐT hoặc mật khẩu không chính xác!",
      });
    }

    // 1. Tạo Access Token (ngắn hạn) & Refresh Token (dài hạn)
    const tokenPayload = {
      userId: user.id,
      role: user.role,
      email: user.email,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken({ userId: user.id });

    // 2. Hash Refresh Token và lưu vào bảng refresh_tokens
    const tokenHash = hashToken(refreshToken);
    const expiresAt = getRefreshTokenExpiryDate();

    await db.query(
      `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
       VALUES ($1, $2, $3)`,
      [user.id, tokenHash, expiresAt],
    );

    // 3. Gắn Refresh Token vào HttpOnly Cookie
    setRefreshTokenCookie(res, refreshToken);

    // 4. Trả về thông tin user không bao gồm password_hash
    const userProfile = {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      created_at: user.created_at,
      status: user.status,
      avatar: user.avatar_url,
      tier: user.tier,
      loyalty_points: user.loyalty_points,
      identity_verified: user.identity_verified,
      identity_number: user.identity_number,
      identity_front_url: user.identity_front_url,
      identity_back_url: user.identity_back_url,
    };

    return res.json({
      success: true,
      message: "Đăng nhập thành công!",
      accessToken,
      token: accessToken,
      user: userProfile,
    });
  } catch (error) {
    console.error("Lỗi Login:", error);
    return res
      .status(500)
      .json({ success: false, error: "Lỗi hệ thống khi đăng nhập!" });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const incomingRefreshToken = req.cookies?.refreshToken;

    if (!incomingRefreshToken) {
      return res.status(401).json({
        success: false,
        error: "Không tìm thấy Refresh Token!",
      });
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(incomingRefreshToken);
    } catch (err) {
      res.clearCookie("refreshToken", { path: "/" });
      return res.status(401).json({
        success: false,
        error: "Refresh Token không hợp lệ hoặc đã hết hạn!",
      });
    }

    const tokenHash = hashToken(incomingRefreshToken);

    // 2. Truy vấn bản ghi trong bảng refresh_tokens
    const tokenQuery = await db.query(
      "SELECT * FROM refresh_tokens WHERE token_hash = $1",
      [tokenHash],
    );
    const storedToken = tokenQuery.rows[0];

    if (!storedToken) {
      return res.status(401).json({
        success: false,
        error: "Refresh Token không tồn tại trong hệ thống!",
      });
    }

    // 3. Phát hiện tái sử dụng token đã bị revoke -> thu hồi toàn bộ phiên của user
    if (storedToken.revoked_at) {
      await db.query(
        "UPDATE refresh_tokens SET revoked_at = NOW() WHERE user_id = $1 AND revoked_at IS NULL",
        [storedToken.user_id],
      );
      res.clearCookie("refreshToken", { path: "/" });
      return res.status(401).json({
        success: false,
        error: "Refresh Token đã bị thu hồi. Vui lòng đăng nhập lại!",
      });
    }

    // 4. Kiểm tra hết hạn trong DB
    if (new Date(storedToken.expires_at) <= new Date()) {
      return res.status(401).json({
        success: false,
        error: "Refresh Token đã hết hạn!",
      });
    }

    // 5. Lấy thông tin user mới nhất để ký Access Token
    const userQuery = await db.query(
      "SELECT id, role, email, status FROM users WHERE id = $1",
      [decoded.userId],
    );
    const user = userQuery.rows[0];

    if (!user || user.status !== "active") {
      res.clearCookie("refreshToken", { path: "/" });
      return res.status(401).json({
        success: false,
        error: "Tài khoản không tồn tại hoặc đã bị khóa!",
      });
    }

    // 6. Token Rotation: thu hồi refresh token cũ & tạo cặp token mới
    await db.query(
      "UPDATE refresh_tokens SET revoked_at = NOW() WHERE id = $1",
      [storedToken.id],
    );

    const newAccessToken = generateAccessToken({
      userId: user.id,
      role: user.role,
      email: user.email,
    });
    const newRefreshToken = generateRefreshToken({ userId: user.id });
    const newTokenHash = hashToken(newRefreshToken);
    const newExpiresAt = getRefreshTokenExpiryDate();

    await db.query(
      `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
       VALUES ($1, $2, $3)`,
      [user.id, newTokenHash, newExpiresAt],
    );

    setRefreshTokenCookie(res, newRefreshToken);

    return res.json({
      success: true,
      message: "Làm mới token thành công!",
      accessToken: newAccessToken,
      token: newAccessToken,
    });
  } catch (error) {
    console.error("Lỗi Refresh Token:", error);
    return res.status(500).json({
      success: false,
      error: "Lỗi hệ thống khi làm mới token!",
    });
  }
};

exports.logout = async (req, res) => {
  try {
    const incomingRefreshToken = req.cookies?.refreshToken;

    if (incomingRefreshToken) {
      const tokenHash = hashToken(incomingRefreshToken);
      await db.query(
        "UPDATE refresh_tokens SET revoked_at = NOW() WHERE token_hash = $1 AND revoked_at IS NULL",
        [tokenHash],
      );
    }

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return res.json({
      success: true,
      message: "Đăng xuất thành công!",
    });
  } catch (error) {
    console.error("Lỗi Logout:", error);
    return res.status(500).json({
      success: false,
      error: "Lỗi hệ thống khi đăng xuất!",
    });
  }
};
