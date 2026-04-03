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

  async createUser({ full_name, login, password, role }) {
    const query = `
      INSERT INTO users (full_name, login, password_hash, role)
      VALUES ($1, $2, crypt($3, gen_salt('bf')), $4)
      RETURNING id, full_name, login, role
    `;

    const { rows } = await pool.query(query, [
      full_name,
      login,
      password,
      role
    ]);

    return rows[0];
  }
}

module.exports = UserDao;