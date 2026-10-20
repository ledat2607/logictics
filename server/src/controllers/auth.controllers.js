const jwt = require("jsonwebtoken");
const db = require("../config/db");
const bcrypt = require("bcryptjs");

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;

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

    console.log(
      "👤 Đăng ký người dùng mới thành công:",
      newUser.email,
      newUser.phone,
    );

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
    const { email, password, phone_number } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Vui lòng nhập đầy đủ Email và Mật khẩu!",
      });
    }

    // Tìm user theo email
    const userQuery = `SELECT * FROM users WHERE email = $1;`;
    const { rows } = await db.query(userQuery, [email.toLowerCase().trim()]);

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: "Email hoặc mật khẩu không chính xác!",
      });
    }

    const user = rows[0];

    // So sánh mật khẩu băm
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: "Email hoặc mật khẩu không chính xác!",
      });
    }

    // Tạo JWT Token
    const token = jwt.sign(
      { userId: user.id, role: user.role, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" },
    );

    // Trả về thông tin không bao gồm password_hash
    const userProfile = {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      created_at: user.created_at,
      status: user.status,
    };

    console.log("🔑 Đăng nhập thành công:", user.email);

    return res.json({
      success: true,
      message: "Đăng nhập thành công!",
      token,
      user: userProfile,
    });
  } catch (error) {
    console.error("Lỗi Login:", error);
    return res
      .status(500)
      .json({ success: false, error: "Lỗi hệ thống khi đăng nhập!" });
  }
};
