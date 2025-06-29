const bcrypt = require('bcrypt');
const crypto = require('crypto');
const userModel = require('../models/userModel');
const { sendVerificationEmail } = require('../utils/mailer');
const { sendResetEmail } = require('../utils/mailer'); 
const jwt = require('jsonwebtoken');

async function register(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: '邮箱和密码不能为空' });
  }

  const existingUser = userModel.findUserByEmail(email);
  if (existingUser) {
    return res.status(409).json({ message: '该邮箱已注册' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const verifyToken = crypto.randomBytes(32).toString('hex');

  try {
    userModel.createUser(email, passwordHash, verifyToken);
    await sendVerificationEmail(email, verifyToken);
    return res.status(201).json({ message: '注册成功，请验证邮箱' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: '注册失败，可能是数据库或邮件服务异常' });
  }
}

async function verifyEmail(req, res) {
  const token = req.query.token;

  if (!token) {
    return res.status(400).send('缺少 token 参数');
  }

  const user = userModel.findUserByVerifyToken(token);

  if (!user) {
    return res.status(400).send('验证链接无效或用户不存在');
  }

  if (user.is_verified) {
    return res.send('该账号已验证，请勿重复操作');
  }

  try {
    userModel.verifyUserByToken(token);
    return res.send('邮箱验证成功，您现在可以登录了');
  } catch (err) {
    console.error(err);
    return res.status(500).send('服务器错误，请稍后再试');
  }
}


async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: '邮箱和密码不能为空' });
  }

  const user = userModel.findUserByEmail(email);
  if (!user) {
    return res.status(401).json({ message: '账号或密码错误' });
  }

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    return res.status(401).json({ message: '账号或密码错误' });
  }

  if (!user.is_verified) {
    return res.status(403).json({ message: '请先验证邮箱再登录' });
  }

  // ✅ 生成 JWT token
  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
  );

  // 返回 JSON（前端收到后再跳转）
  return res.json({
    message: '登录成功',
    token: token,
  });
}




async function requestPasswordReset(req, res) {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: '请提供邮箱' });

  const user = userModel.findUserByEmail(email);
  if (!user) return res.status(200).json({ message: '如果该邮箱存在，我们已发送重置邮件' });

  const token = crypto.randomBytes(32).toString('hex');
  const expires = Date.now() + 1000 * 60 * 60; // 1小时有效

  userModel.saveResetToken(email, token, expires);
  await sendResetEmail(email, token);

  return res.status(200).json({ message: '重置邮件已发送，如未收到请稍后再试' });
}


async function resetPassword(req, res) {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ message: '缺少 token 或新密码' });
  }

  const user = userModel.findUserByResetToken(token);

  if (!user) {
    return res.status(400).json({ message: '无效的重置链接' });
  }

  if (Date.now() > user.reset_token_expires) {
    return res.status(400).json({ message: '重置链接已过期，请重新申请' });
  }

  try {
    const newPasswordHash = await bcrypt.hash(password, 10);
    userModel.updatePasswordByResetToken(token, newPasswordHash);
    return res.status(200).json({ message: '密码重置成功，请使用新密码登录' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: '服务器错误，请稍后再试' });
  }
}

async function changePassword(req, res) {
  const { oldPassword, newPassword } = req.body;
  const userId = req.user.id;

  if (!oldPassword || !newPassword) {
    return res.status(400).json({ message: '旧密码和新密码不能为空' });
  }

  const user = userModel.findUserById(userId);
  if (!user) {
    return res.status(404).json({ message: '用户不存在' });
  }

  const isMatch = await bcrypt.compare(oldPassword, user.password_hash);
  if (!isMatch) {
    return res.status(401).json({ message: '旧密码不正确' });
  }

  const newHash = await bcrypt.hash(newPassword, 10);
  userModel.updatePasswordByUserId(userId, newHash);

  return res.json({ message: '密码修改成功' });
}



module.exports = {
  register,
  verifyEmail,
  login,
  requestPasswordReset,
  resetPassword,
  changePassword,
};

