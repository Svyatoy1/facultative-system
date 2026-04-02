class AuthService {
  constructor(userDao) {
    this.userDao = userDao;
  }

  async login(login, password) {
    if (!login || !password) {
      return {
        ok: false,
        status: 400,
        message: 'Login and password are required.'
      };
    }

    const normalizedLogin = login.trim();

    const user = await this.userDao.verifyCredentials(normalizedLogin, password);

    if (!user) {
      return {
        ok: false,
        status: 401,
        message: 'Invalid login or password.'
      };
    }

    return {
      ok: true,
      status: 200,
      user
    };
  }
}

module.exports = AuthService;