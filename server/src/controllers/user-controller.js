const db = require("../config/db");

const { cloudinary } = require("../config/cloudinary");

exports.updateProfile = async (req, res) => {
  try {
    const { full_name, email, phone } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res
        .status(401)
        .json({ error: "Không tìm thấy thông tin định danh người dùng!" });
    }

    const userQuery = "SELECT avatar_url FROM users WHERE id = $1";
    const userResult = await db.query(userQuery, [userId]);
    const oldAvatarUrl = userResult.rows[0]?.avatar_url;

    let avatarUrl = oldAvatarUrl;

    if (req.file) {
      avatarUrl = req.file.path;

      if (oldAvatarUrl && oldAvatarUrl.includes("cloudinary.com")) {
        try {
          const parts = oldAvatarUrl.split("/upload/");
          if (parts.length >= 2) {
            let pathWithoutVersion = parts[1].replace(/^v\d+\//, "");
            const publicId = pathWithoutVersion.substring(
              0,
              pathWithoutVersion.lastIndexOf("."),
            );

            await cloudinary.uploader.destroy(publicId);
            console.log(
              "🗑️ Đã xóa ảnh cũ trên Cloudinary thành công:",
              publicId,
            );
          }
        } catch (delErr) {
          console.error(
            "⚠️ Không thể xóa ảnh cũ trên Cloudinary (bỏ qua lỗi này để không làm gián đoạn việc update):",
            delErr,
          );
        }
      }
    }

    const updateQuery = `
      UPDATE users 
      SET full_name = $1, email = $2, phone = $3, avatar_url = $4
      WHERE id = $5 
      RETURNING id, full_name, email, phone, avatar_url;
    `;

    const values = [full_name, email, phone, avatarUrl, userId];
    const { rows } = await db.query(updateQuery, values);

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ error: "Không tìm thấy người dùng trong cơ sở dữ liệu!" });
    }

    const updatedUser = rows[0];

    res.status(200).json({
      success: true,
      message: "Cập nhật thông tin thành công!",
      avatar: updatedUser.avatar_url,
      user: updatedUser,
    });
  } catch (error) {
    console.error("❌ Error updating user profile:", error);
    res
      .status(500)
      .json({ error: error.message || "Lỗi hệ thống khi cập nhật thông tin!" });
  }
};

exports.updateKYC = async (req, res) => {
  try {
    const { identity_number } = req.body;

    const userId = req.user?.userId;

    const frontImageFile = req.files?.front_image
      ? req.files.front_image[0]
      : null;
    const backImageFile = req.files?.back_image
      ? req.files.back_image[0]
      : null;

    const front_url = frontImageFile ? frontImageFile.path : null;
    const back_url = backImageFile ? backImageFile.path : null;

    if (!identity_number) {
      return res.status(400).json({
        error:
          "Vui lòng cung cấp đầy đủ thông tin KYC (số CCCD và ảnh mặt trước, mặt sau)!",
      });
    }

    const updateData = {
      identity_number,
      identity_verified: true,
      ...(frontImageFile && { front_image_url: frontImageFile.path }),
      ...(backImageFile && { back_image_url: backImageFile.path }),
    };

    const query = `
      UPDATE users 
      SET identity_number = $1, 
          identity_front_url = COALESCE($2, identity_front_url), 
          identity_back_url = COALESCE($3, identity_back_url), 
          identity_verified = true 
      WHERE id = $4 
      RETURNING id, full_name, email, identity_number, identity_front_url, identity_back_url, identity_verified;
    `;

    const values = [identity_number, front_url, back_url, userId];
    const result = await db.query(query, values);

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ error: "Không tìm thấy người dùng trong hệ thống!" });
    }

    return res.status(200).json({
      message: "Cập nhật định danh KYC thành công!",
      user: result.rows[0],
    });


  } catch (error) {
    console.error("❌ Error updating KYC information:", error);
    res.status(500).json({
      error: error.message || "Lỗi hệ thống khi cập nhật thông tin KYC!",
    });
  }
};
