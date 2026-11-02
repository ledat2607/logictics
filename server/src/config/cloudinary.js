const cloudinary = require("cloudinary").v2;

const { CloudinaryStorage } = require("multer-storage-cloudinary");

const multer = require("multer");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "logistics_avatars",
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
    public_id: (req, file) =>
      `avatar_${Date.now()}_${Math.round(Math.random() * 1000)}`, // Tự sinh tên sạch sẽ
    transformation: [{ width: 500, height: 500, crop: "limit" }],
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Chỉ được phép tải lên file hình ảnh!"), false);
    }
  },
});

module.exports = { cloudinary, upload };
