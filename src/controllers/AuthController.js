const CookieHelper = require('../core/session/CookieHelper');
const logger = require('../utils/logger');

class AuthController {
  constructor(authService, sessionManager, viewRenderer) {
    this.authService = authService;
    this.sessionManager = sessionManager;
    this.viewRenderer = viewRenderer;
  }

  async showLogin(req, res) {
    const successMessage =
      req.query.registered === '1'
        ? 'Registration completed successfully. Now you can sign in.'
        : '';

    const logoutMessage =
      req.query.logout === '1'
        ? 'You have successfully logged out.'
        : '';

    await this.renderLoginForm(
      res,
      '',
      200,
      {},
      successMessage,
      Boolean(req.user),
      logoutMessage
    );
  }

  async login(req, res) {
    const { login, password } = req.body;

    const result = await this.authService.login(login, password);

    if (!result.ok) {
      logger.warn('Login failed', {
        login: login || null,
        reason: result.message
      });

      await this.renderLoginForm(
        res,
        result.message,
        result.status,
        { login },
        '',
        Boolean(req.user),
        ''
      );
      return;
    }

    const { user } = result;
    const sessionId = this.sessionManager.createSession(user);

    logger.info('Login successful', {
      userId: user.id,
      login: user.login,
      role: user.role,
      sessionId
    });

    CookieHelper.setCookie(res, 'sid', sessionId, {
      httpOnly: true,
      path: '/',
      sameSite: 'Lax',
      maxAge: 60 * 60 * 24
    });

    res.writeHead(302, { Location: '/dashboard?initWindowAuth=1' });
    res.end();
  }

  async showRegister(req, res) {
    await this.renderRegisterForm(res, '', 200, {}, Boolean(req.user));
  }

  async register(req, res) {
    const result = await this.authService.register(req.body);

    if (!result.ok) {
      logger.warn('Registration failed', {
        login: req.body.login || null,
        role: req.body.role || null,
        reason: result.message
      });

      await this.renderRegisterForm(
        res,
        result.message,
        result.status,
        req.body,
        Boolean(req.user)
      );
      return;
    }

    logger.info('Registration successful', {
      userId: result.user.id,
      login: result.user.login,
      role: result.user.role
    });

    res.writeHead(302, { Location: '/login?registered=1' });
    res.end();
  }

  async logout(req, res) {
    logger.info('Logout', {
      userId: req.user?.id || null,
      login: req.user?.login || null,
      sessionId: req.sessionId || null
    });

    this.sessionManager.destroySession(req.sessionId);

    CookieHelper.clearCookie(res, 'sid', {
      path: '/',
      sameSite: 'Lax'
    });

    res.writeHead(302, { Location: '/login?logout=1' });
    res.end();
  }

  async renderLoginForm(
    res,
    errorMessage = '',
    statusCode = 200,
    formValues = {},
    successMessage = '',
    serverSessionActive = false,
    logoutMessage = ''
  ) {
    await this.viewRenderer.render(
      res,
      'auth/login',
      {
        title: 'Login',
        user: null,
        errorMessage,
        successMessage,
        logoutMessage,
        formValues,
        isAuthPage: true,
        serverSessionActive
      },
      statusCode
    );
  }

  async renderRegisterForm(
    res,
    errorMessage = '',
    statusCode = 200,
    formValues = {},
    serverSessionActive = false
  ) {
    await this.viewRenderer.render(
      res,
      'auth/register',
      {
        title: 'Register',
        user: null,
        errorMessage,
        formValues,
        isAuthPage: true,
        serverSessionActive
      },
      statusCode
    );
  }
}

module.exports = AuthController;