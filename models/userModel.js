const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, '../db/database.db'));

// 添加用户
function createUser(email, passwordHash, verifyToken) {
  const stmt = db.prepare(`
    INSERT INTO users (email, password_hash, is_verified, verify_token)
    VALUES (?, ?, 0, ?)
  `);
  return stmt.run(email, passwordHash, verifyToken);
}

// 查找用户（通过 email）
function findUserByEmail(email) {
  const stmt = db.prepare(`SELECT * FROM users WHERE email = ?`);
  return stmt.get(email);
}

function findUserByVerifyToken(token) {
  const stmt = db.prepare(`SELECT * FROM users WHERE verify_token = ?`);
  return stmt.get(token);
}

function verifyUserByToken(token) {
  const stmt = db.prepare(`
    UPDATE users
    SET is_verified = 1,
        verify_token = NULL
    WHERE verify_token = ?
  `);
  return stmt.run(token);
}

function saveResetToken(email, token, expires) {
  const stmt = db.prepare(`
    UPDATE users
    SET reset_token = ?, reset_token_expires = ?
    WHERE email = ?
  `);
  stmt.run(token, expires, email);
}

function findUserByResetToken(token) {
  const stmt = db.prepare(`
    SELECT * FROM users WHERE reset_token = ?
  `);
  return stmt.get(token);
}

function updatePasswordByResetToken(token, newPasswordHash) {

  const stmt = db.prepare(`
    UPDATE users
    SET password_hash = ?, reset_token = NULL, reset_token_expires = NULL
    WHERE reset_token = ?
  `);

  stmt.run(newPasswordHash, token);
}

function findUserById(id) {
  const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
  return stmt.get(id);
}

//Password-change functioin
function updatePasswordByUserId(id, passwordHash) {
  const stmt = db.prepare('UPDATE users SET password_hash = ? WHERE id = ?');
  stmt.run(passwordHash, id);
}




module.exports = {
  createUser,
  findUserByEmail,
  findUserByVerifyToken,
  verifyUserByToken,
  saveResetToken,
  findUserByResetToken,
  updatePasswordByResetToken,
  findUserById,
  updatePasswordByUserId,
};

