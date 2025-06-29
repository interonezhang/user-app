require('dotenv').config(); // 加载 .env 文件
const jwt = require('jsonwebtoken');

// 设置要生成 token 的用户信息（id 和 email 必须和数据库中一致）
const payload = {
  id: 4,
  email: '18813935253@139.com',
};

// 从环境变量中读取密钥和过期时间
const secret = process.env.JWT_SECRET;
const expiresIn = process.env.JWT_EXPIRES_IN || '1h';

// 检查密钥是否存在
if (!secret) {
  console.error('❌ 错误：找不到 JWT_SECRET，请检查 .env 文件是否存在且配置正确');
  process.exit(1);
}

// 生成 token
const token = jwt.sign(payload, secret, { expiresIn });

console.log('✅ 生成的 JWT Token：\n');
console.log(token);

