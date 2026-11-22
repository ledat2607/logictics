const db = require("../config/db");

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const getUserId = (req) =>
  req.user?.userId || req.user?.id || req.params?.userId || req.body?.userId;

const isValidUUID = (uuid) => typeof uuid === "string" && UUID_REGEX.test(uuid);

const normalizeCoord = (value) => {
  if (value === undefined || value === null) return null;

  const num = Number(value);
  return Number.isFinite(num) ? num : NaN;
};

//get all addresses of a user
exports.getAllAddresses = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "Không tìm thấy người dùng!" });
    }

    const result = await db.query(
      `SELECT
         id,
         user_id,
         contact_name,
         contact_phone,
         street_address,
         ward,
         district,
         province,
         country_code,
         latitude,
         longitude,
         is_default,
         created_at
       FROM addresses
       WHERE user_id = $1
       ORDER BY is_default DESC, created_at DESC`,
      [userId],
    );
    return res.json({ success: true, addresses: result.rows });
  } catch (error) {
    console.error("Error fetching addresses:", error);
    return res.status(500).json({ success: false, message: "Lỗi hệ thống!" });
  }
};

//create a new address for a user
exports.createAddress = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Không tìm thấy người dùng!",
      });
    }

    const {
      contact_name,
      contact_phone,
      street_address,
      ward = null,
      district,
      province,
      country_code = "VN",
      latitude = null,
      longitude = null,
      is_default = false,
    } = req.body;

    if (
      !contact_name ||
      !contact_phone ||
      !street_address ||
      !district ||
      !province
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Vui lòng nhập đầy đủ tên liên hệ, số điện thoại, địa chỉ đường/số nhà, quận/huyện và tỉnh/thành!",
      });
    }

    const lat = normalizeCoord(latitude);
    const lng = normalizeCoord(longitude);
    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      return res.status(400).json({
        success: false,
        message: "Tọa độ latitude / longitude không hợp lệ!",
      });
    }

    const countRes = await db.query(
      "SELECT COUNT(*)::int AS total FROM addresses WHERE user_id = $1",
      [userId],
    );
    const shouldBeDefault = Boolean(is_default) || countRes.rows[0].total === 0;

    if (shouldBeDefault) {
      await db.query(
        "UPDATE addresses SET is_default = false WHERE user_id = $1 AND is_default = true",
        [userId],
      );
    }

    const insertRes = await db.query(
      `INSERT INTO addresses (
         user_id,
         contact_name,
         contact_phone,
         street_address,
         ward,
         district,
         province,
         country_code,
         latitude,
         longitude,
         is_default
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        userId,
        String(contact_name).trim(),
        String(contact_phone).trim(),
        String(street_address).trim(),
        ward ? String(ward).trim() : null,
        String(district).trim(),
        String(province).trim(),
        country_code ? String(country_code).trim().toUpperCase() : "VN",
        lat,
        lng,
        shouldBeDefault,
      ],
    );

    return res.status(201).json({
      success: true,
      message: "Thêm địa chỉ thành công!",
      address: insertRes.rows[0],
    });
  } catch (error) {
    console.error("Lỗi tạo địa chỉ:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi hệ thống khi thêm địa chỉ!",
    });
  }
};

// PUT /api/addresses/:id - Cập nhật địa chỉ
exports.updateAddress = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { id } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Không tìm thấy người dùng!",
      });
    }

    if (!isValidUUID(id)) {
      return res.status(400).json({
        success: false,
        message: "ID địa chỉ không hợp lệ!",
      });
    }

    const existingRes = await db.query(
      "SELECT * FROM addresses WHERE id = $1 AND user_id = $2",
      [id, userId],
    );
    if (existingRes.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy địa chỉ!",
      });
    }

    const current = existingRes.rows[0];
    const {
      contact_name = current.contact_name,
      contact_phone = current.contact_phone,
      street_address = current.street_address,
      ward = current.ward,
      district = current.district,
      province = current.province,
      country_code = current.country_code,
      latitude = current.latitude,
      longitude = current.longitude,
      is_default = current.is_default,
    } = req.body;

    if (
      !contact_name ||
      !contact_phone ||
      !street_address ||
      !district ||
      !province
    ) {
      return res.status(400).json({
        success: false,
        message: "Các trường bắt buộc không được để trống!",
      });
    }

    const lat = normalizeCoord(latitude);
    const lng = normalizeCoord(longitude);
    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      return res.status(400).json({
        success: false,
        message: "Tọa độ latitude / longitude không hợp lệ!",
      });
    }

    const nextDefault = Boolean(is_default);
    if (nextDefault && !current.is_default) {
      await db.query(
        "UPDATE addresses SET is_default = false WHERE user_id = $1 AND is_default = true",
        [userId],
      );
    }

    const updateRes = await db.query(
      `UPDATE addresses
       SET
         contact_name = $1,
         contact_phone = $2,
         street_address = $3,
         ward = $4,
         district = $5,
         province = $6,
         country_code = $7,
         latitude = $8,
         longitude = $9,
         is_default = $10
       WHERE id = $11 AND user_id = $12
       RETURNING *`,
      [
        String(contact_name).trim(),
        String(contact_phone).trim(),
        String(street_address).trim(),
        ward ? String(ward).trim() : null,
        String(district).trim(),
        String(province).trim(),
        country_code ? String(country_code).trim().toUpperCase() : "VN",
        lat,
        lng,
        nextDefault,
        id,
        userId,
      ],
    );

    // Nếu bỏ tick mặc định trên địa chỉ đang là mặc định -> tự gán địa chỉ mới nhất khác làm mặc định
    if (current.is_default && !nextDefault) {
      await db.query(
        `UPDATE addresses
         SET is_default = true
         WHERE id = (
           SELECT id FROM addresses
           WHERE user_id = $1 AND id <> $2
           ORDER BY created_at DESC
           LIMIT 1
         )`,
        [userId, id],
      );
    }

    return res.json({
      success: true,
      message: "Cập nhật địa chỉ thành công!",
      address: updateRes.rows[0],
    });
  } catch (error) {
    console.error("Lỗi cập nhật địa chỉ:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi hệ thống khi cập nhật địa chỉ!",
    });
  }
};

// PATCH /api/addresses/:id/default - Đặt địa chỉ mặc định
exports.setDefaultAddress = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { id } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Không tìm thấy người dùng!",
      });
    }

    if (!isValidUUID(id)) {
      return res.status(400).json({
        success: false,
        message: "ID địa chỉ không hợp lệ!",
      });
    }

    const found = await db.query(
      "SELECT id FROM addresses WHERE id = $1 AND user_id = $2",
      [id, userId],
    );
    if (found.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy địa chỉ!",
      });
    }

    await db.query(
      "UPDATE addresses SET is_default = false WHERE user_id = $1 AND is_default = true",
      [userId],
    );

    const updated = await db.query(
      `UPDATE addresses
       SET is_default = true
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [id, userId],
    );

    return res.json({
      success: true,
      message: "Đã đặt làm địa chỉ mặc định!",
      address: updated.rows[0],
    });
  } catch (error) {
    console.error("Lỗi đặt địa chỉ mặc định:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi hệ thống khi đặt địa chỉ mặc định!",
    });
  }
};

// DELETE /api/addresses/:id - Xóa địa chỉ
exports.deleteAddress = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { id } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Không tìm thấy người dùng!",
      });
    }

    if (!isValidUUID(id)) {
      return res.status(400).json({
        success: false,
        message: "ID địa chỉ không hợp lệ!",
      });
    }

    const deletedRes = await db.query(
      "DELETE FROM addresses WHERE id = $1 AND user_id = $2 RETURNING *",
      [id, userId],
    );

    if (deletedRes.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy địa chỉ!",
      });
    }

    // Nếu xóa trúng địa chỉ mặc định -> tự đẩy địa chỉ gần nhất còn lại lên làm mặc định
    if (deletedRes.rows[0].is_default) {
      await db.query(
        `UPDATE addresses
         SET is_default = true
         WHERE id = (
           SELECT id FROM addresses
           WHERE user_id = $1
           ORDER BY created_at DESC
           LIMIT 1
         )`,
        [userId],
      );
    }

    return res.json({
      success: true,
      message: "Xóa địa chỉ thành công!",
    });
  } catch (error) {
    console.error("Lỗi xóa địa chỉ:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi hệ thống khi xóa địa chỉ!",
    });
  }
};
