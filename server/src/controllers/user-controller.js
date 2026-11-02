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
