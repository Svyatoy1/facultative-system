const CookieHelper = require('../core/session/CookieHelper');

class AuthController {
  constructor(authService, sessionManager, viewRenderer) {
    this.authService = authService;
    this.sessionManager = sessionManager;
    this.viewRenderer = viewRenderer;
  }

  async showLogin(req, res) {
    if (req.user) {
      res.writeHead(302, { Location: '/dashboard' });
      res.end();
      return;
    }

    await this.renderLoginForm(res);
  }

  async login(req, res) {
    const { login, password } = req.body;

    const result = await this.authService.login(login, password);

    if (!result.ok) {
      await this.renderLoginForm(
        res,
        result.message,
        result.status,
        { login }
      );
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

  async renderLoginForm(
    res,
    errorMessage = '',
    statusCode = 200,
    formValues = {}
  ) {
    await this.viewRenderer.render(
      res,
      'auth/login',
      {
        title: 'Login',
        user: null,
        errorMessage,
        formValues
      },
      statusCode
    );
  }
}

module.exports = AuthController;