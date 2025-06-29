// utils/mailer.js
const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',   // 指定主机
  port: 587,                // STARTTLS 端口
  secure: false,  
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  connectionTimeout: 10_000,
  greetingTimeout: 10_000,
});
module.exports = transporter;

/**
 * 发送验证邮件
 */
function sendVerificationEmail(to, token) {
  const verifyUrl = `http://localhost:3000/auth/verify-email?token=${token}`;
  return transporter.sendMail({
    from: `"User Auth System" <${process.env.EMAIL_USER}>`,
    to,
    subject: '请验证您的邮箱',
    text: `欢迎注册，请点击以下链接验证邮箱：\n\n${verifyUrl}\n\n如果不是你本人操作，请忽略此邮件。`,
  });
}

function sendResetEmail(to, token) {
  const resetUrl = `http://localhost:3000/auth/reset-password?token=${token}`;
  return transporter.sendMail({
    from: `"User Auth System" <${process.env.EMAIL_USER}>`,
    to,
    subject: '找回密码链接',
    text: `请点击以下链接重置密码（1小时内有效）：\n\n${resetUrl}`,
  });
}





module.exports = {
  sendVerificationEmail,
  sendResetEmail,
};

