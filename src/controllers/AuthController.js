const CookieHelper = require('../core/session/CookieHelper');

class AuthController {
  constructor(authService, sessionManager) {
    this.authService = authService;
    this.sessionManager = sessionManager;
  }

  async showLogin(req, res) {
    if (req.user) {
      res.writeHead(302, { Location: '/dashboard' });
      res.end();
      return;
    }

    this.renderLoginForm(res);
  }

  async login(req, res) {
    const { login, password } = req.body;

    const result = await this.authService.login(login, password);

    if (!result.ok) {
      this.renderLoginForm(res, result.message, result.status);
      return;
    }

    const { user } = result;
    const sessionId = this.sessionManager.createSession(user);

    CookieHelper.setCookie(res, 'sid', sessionId, {
      httpOnly: true,
      path: '/',
      sameSite: 'Lax',
      maxAge: 60 * 60 * 24
    });

    res.writeHead(302, { Location: '/dashboard' });
    res.end();
  }

  async logout(req, res) {
    this.sessionManager.destroySession(req.sessionId);

    CookieHelper.clearCookie(res, 'sid', {
      path: '/',
      sameSite: 'Lax'
    });

    res.writeHead(302, { Location: '/login' });
    res.end();
  }

  renderLoginForm(res, errorMessage = '', statusCode = 200) {
    res.writeHead(statusCode, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`
      <h1>Login page</h1>

      ${errorMessage ? `<p style="color:red;">${errorMessage}</p>` : ''}

      <form method="POST" action="/login">
        <div style="margin-bottom: 10px;">
          <label for="login">Login:</label><br />
          <input id="login" type="text" name="login" />
        </div>

        <div style="margin-bottom: 10px;">
          <label for="password">Password:</label><br />
          <input id="password" type="password" name="password" />
        </div>

        <button type="submit">Sign in</button>
      </form>
    `);
  }
}

module.exports = AuthController;