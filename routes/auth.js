const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
const authenticateToken = require('../middleware/authMiddleware');


// 注册相关路由
router.post('/register', authController.register);
router.get('/verify-email', authController.verifyEmail);
router.post('/login', authController.login);
router.post('/request-password-reset', authController.requestPasswordReset);
router.post('/reset-password', authController.resetPassword);
router.post('/change-password', authenticateToken, authController.changePassword);

// JWT 认证：获取当前用户信息（登录状态检查）
router.get('/me', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];


  if (!token) {
    return res.status(401).json({ message: '未提供 token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = userModel.findUserById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    return res.json({ email: user.email });
  } catch (err) {
    return res.status(403).json({ message: 'token 无效或已过期' });
  }
});

module.exports = router;

