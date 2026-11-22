const express = require('express');
const router = express.Router();
const addressController = require('../controllers/addresses-controllers');
const verifyToken = require('../middlewares/auth.middleware');

//1. Lấy tất cả địa chỉ của người dùng
router.get('/all-addresses',verifyToken, addressController.getAllAddresses);

//2. Tạo địa chỉ mới cho người dùng
router.post('/add-new-address', verifyToken, addressController.createAddress);


//3 . Cập nhật địa chỉ của người dùng
router.put('/update-address/:id', verifyToken, addressController.updateAddress);

//4. Xóa địa chỉ của người dùng
router.delete('/delete-address/:id', verifyToken, addressController.deleteAddress);


//5. Lấy địa chỉ mặc định của người dùng
router.patch('/:id/default-address', verifyToken, addressController.setDefaultAddress);

module.exports = router;