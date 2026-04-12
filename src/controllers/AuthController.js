const CookieHelper = require('../core/session/CookieHelper');
const logger = require('../utils/logger');

class AuthController {
  constructor(authService, sessionManager, viewRenderer) {
    this.authService = authService;
    this.sessionManager = sessionManager;
    this.viewRenderer = viewRenderer;
  }

  getZoneTitle(zone) {
    if (zone === 'student') {
      return 'Student Login';
    }

    if (zone === 'teacher') {
      return 'Teacher Login';
    }

    if (zone === 'admin') {
      return 'Admin Login';
    }

    return 'Login';
  }

  async showLogin(req, res) {
    const zone = req.authZone;

    if (!zone) {
      res.writeHead(302, { Location: '/student/login' });
      res.end();
      return;
    }

    if (req.user) {
      res.writeHead(302, { Location: `/${zone}/dashboard` });
      res.end();
      return;
    }

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
      zone,
      '',
      200,
      {},
      successMessage,
      logoutMessage
    );
  }

  async login(req, res) {
    const zone = req.authZone;
    const { login, password } = req.body;

    if (!zone) {
      res.writeHead(302, { Location: '/student/login' });
      res.end();
      return;
    }

    const result = await this.authService.login(login, password);

    if (!result.ok) {
      logger.warn('Login failed', {
        zone,
        login: login || null,
        reason: result.message
      });

      await this.renderLoginForm(
        res,
        zone,
        result.message,
        result.status,
        { login }
      );
      return;
    }

    if (result.user.role !== zone) {
      const zoneMessage =
        zone === 'student'
          ? 'This account does not belong to the student area.'
          : zone === 'teacher'
          ? 'This account does not belong to the teacher area.'
          : 'This account does not belong to the admin area.';

      await this.renderLoginForm(
        res,
        zone,
        zoneMessage,
        403,
        { login }
      );
      return;
    }

    const sessionId = this.sessionManager.createSession(result.user, zone);
    const cookieConfig = this.sessionManager.getCookieConfig(zone);
    const cookieOptions = this.sessionManager.getCookieOptions(zone);

    logger.info('Login successful', {
      userId: result.user.id,
      login: result.user.login,
      role: result.user.role,
      zone,
      sessionId
    });

    CookieHelper.setCookie(
      res,
      cookieConfig.cookieName,
      sessionId,
      cookieOptions
    );

    res.writeHead(302, { Location: `/${zone}/dashboard` });
    res.end();
  }

  async showRegister(req, res) {
    await this.renderRegisterForm(res);
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
        req.body
      );
      return;
    }

    logger.info('Registration successful', {
      userId: result.user.id,
      login: result.user.login,
      role: result.user.role
    });

    res.writeHead(302, {
      Location: `/${result.user.role}/login?registered=1`
    });
    res.end();
  }

  async logout(req, res) {
    const zone = req.authZone;

    if (!zone) {
      res.writeHead(302, { Location: '/student/login' });
      res.end();
      return;
    }

    const cookieConfig = this.sessionManager.getCookieConfig(zone);

    logger.info('Logout', {
      zone,
      userId: req.user?.id || null,
      login: req.user?.login || null,
      sessionId: req.sessionId || null
    });

    this.sessionManager.destroySession(req.sessionId);

    CookieHelper.clearCookie(res, cookieConfig.cookieName, {
      path: cookieConfig.path,
      sameSite: 'Lax'
    });

    res.writeHead(302, { Location: `/${zone}/login?logout=1` });
    res.end();
  }

  async renderLoginForm(
    res,
    zone,
    errorMessage = '',
    statusCode = 200,
    formValues = {},
    successMessage = '',
    logoutMessage = ''
  ) {
    await this.viewRenderer.render(
      res,
      'auth/login',
      {
        title: this.getZoneTitle(zone),
        user: null,
        authZone: zone,
        errorMessage,
        successMessage,
        logoutMessage,
        formValues
      },
      statusCode
    );
  }

  async renderRegisterForm(
    res,
    errorMessage = '',
    statusCode = 200,
    formValues = {}
  ) {
    await this.viewRenderer.render(
      res,
      'auth/register',
      {
        title: 'Register',
        user: null,
        errorMessage,
        formValues
      },
      statusCode
    );
  }
}

module.exports = AuthController;