const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controllers");

// 1. Đăng ký tài khoản
router.post("/register", authController.register);

// 2. Đăng nhập
router.post("/login", authController.login);

//3. Refresh token
router.post("/refresh", authController.refreshToken);   

//4. Đăng xuất
router.post("/logout", authController.logout);

module.exports = router;
