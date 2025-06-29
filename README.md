# 🔐 用户认证系统模板 · Node.js + Express + SQLite + JWT

这是一个开箱即用的用户认证模板，适用于中小型项目、学习、教学或团队初始架构搭建。支持注册登录、邮箱验证、找回密码、JWT 登录态、修改密码以及完整前端页面，适配 Bootstrap 风格。

---

## ✨ 功能特性

- ✅ 用户注册 + 邮箱验证
- ✅ 登录（JWT）+ 本地 token 持久化
- ✅ 忘记密码 + 邮件重置
- ✅ 登录后修改密码
- ✅ 登出 / Token 过期自动跳转
- ✅ 前端页面使用 Bootstrap 美化
- ✅ SQLite 零依赖，适合开发测试
- ✅ 一键 Docker 容器化部署

---

## 🚀 快速开始

### 📦 克隆项目

```bash
git clone https://github.com/<yourname>/user-auth-template.git
cd user-auth-template
cp .env.example .env
npm install
node app.js

