const pool = require('../config/db');

class UserDao {
  async findByLogin(login) {
    const query = `
      SELECT id, full_name, login, role, password_hash
      FROM users
      WHERE login = $1
      LIMIT 1
    `;

    const { rows } = await pool.query(query, [login]);
    return rows[0] || null;
  }

  async verifyCredentials(login, password) {
    const query = `
      SELECT id, full_name, login, role
      FROM users
      WHERE login = $1
        AND password_hash = crypt($2, password_hash)
      LIMIT 1
    `;

    const { rows } = await pool.query(query, [login, password]);
    return rows[0] || null;
  }
}

module.exports = UserDao;