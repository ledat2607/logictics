const express = require("express");
const router = express.Router();

const userController = require("../controllers/user-controller");
const { upload } = require("../config/cloudinary");
const verifyToken = require("../middlewares/auth.middleware");

// 1. Lấy thông tin người dùng
router.put(
  "/profile",
  verifyToken,
  upload.single("avatar"),
  userController.updateProfile,
);



module.exports = router;
