// app.js
require('dotenv').config();
const express = require('express');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// 初始化 SQLite 数据库连接
const dbPath = path.join(__dirname, 'db', 'database.db');
const db = new Database(dbPath);

// 创建 users 表（如果尚未存在）
db.prepare(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    is_verified INTEGER DEFAULT 0,
    verify_token TEXT,
    reset_token TEXT,
    reset_token_expires INTEGER
  )
`).run();

// 👉 注册中间件（用于解析 JSON 请求体）
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// 👉 引入注册路由模块
const authRoutes = require('./routes/auth');
app.use('/auth', authRoutes);  // ⬅️ 挂载所有 /auth 开头的路由

// 测试根路由
app.get('/', (req, res) => {
  res.send('服务运行成功 ✅');
});

// 当用户从邮件点击 http://localhost:3000/auth/reset-password?token=xxx 时，跳转前端页面
app.get('/auth/reset-password', (req, res) => {
  const token = req.query.token;
  if (!token) {
    return res.status(400).send('链接无效，缺少 token 参数');
  }
  // 重定向到 reset-password.html 页面并带上 token 参数
  res.redirect(`/reset-password.html?token=${token}`);
});




// 启动服务
app.listen(PORT, () => {
  console.log(`服务已启动：http://localhost:${PORT}`);
});

