jest.mock('../../src/core/session/CookieHelper', () => ({
  setCookie: jest.fn(),
  clearCookie: jest.fn()
}));

jest.mock('../../src/utils/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
}));

const CookieHelper = require('../../src/core/session/CookieHelper');
const AuthController = require('../../src/controllers/AuthController');

describe('AuthController', () => {
  let authService;
  let sessionManager;
  let viewRenderer;
  let authController;
  let req;
  let res;

  beforeEach(() => {
    authService = {
      login: jest.fn(),
      register: jest.fn()
    };

    sessionManager = {
      createSession: jest.fn(),
      destroySession: jest.fn()
    };

    viewRenderer = {
      render: jest.fn()
    };

    authController = new AuthController(authService, sessionManager, viewRenderer);

    req = {
      user: null,
      query: {},
      body: {},
      sessionId: null
    };

    res = {
      writeHead: jest.fn(),
      end: jest.fn()
    };

    jest.clearAllMocks();
  });

  test('showLogin should redirect to dashboard if user already exists in session', async () => {
    req.user = { id: 1, role: 'student' };

    await authController.showLogin(req, res);

    expect(res.writeHead).toHaveBeenCalledWith(302, { Location: '/dashboard' });
    expect(res.end).toHaveBeenCalled();
    expect(viewRenderer.render).not.toHaveBeenCalled();
  });

  test('showLogin should render login page', async () => {
    await authController.showLogin(req, res);

    expect(viewRenderer.render).toHaveBeenCalledWith(
      res,
      'auth/login',
      expect.objectContaining({
        title: 'Login',
        user: null,
        errorMessage: '',
        successMessage: '',
        formValues: {}
      }),
      200
    );
  });

  test('showLogin should render success message after registration', async () => {
    req.query = { registered: '1' };

    await authController.showLogin(req, res);

    expect(viewRenderer.render).toHaveBeenCalledWith(
      res,
      'auth/login',
      expect.objectContaining({
        successMessage: 'Registration completed successfully. Now you can sign in.'
      }),
      200
    );
  });

  test('login should render login page with error if auth fails', async () => {
    req.body = {
      login: 'student_anna',
      password: 'wrong'
    };

    authService.login.mockResolvedValue({
      ok: false,
      status: 401,
      message: 'Invalid login or password.'
    });

    await authController.login(req, res);

    expect(authService.login).toHaveBeenCalledWith('student_anna', 'wrong');
    expect(viewRenderer.render).toHaveBeenCalledWith(
      res,
      'auth/login',
      expect.objectContaining({
        errorMessage: 'Invalid login or password.',
        formValues: { login: 'student_anna' }
      }),
      401
    );
  });

  test('login should create session and redirect on success', async () => {
    req.body = {
      login: 'student_anna',
      password: 'student123'
    };

    authService.login.mockResolvedValue({
      ok: true,
      status: 200,
      user: {
        id: 4,
        full_name: 'Анна Мельник',
        login: 'student_anna',
        role: 'student'
      }
    });

    sessionManager.createSession.mockReturnValue('session-123');

    await authController.login(req, res);

    expect(sessionManager.createSession).toHaveBeenCalledWith({
      id: 4,
      full_name: 'Анна Мельник',
      login: 'student_anna',
      role: 'student'
    });

    expect(CookieHelper.setCookie).toHaveBeenCalledWith(
      res,
      'sid',
      'session-123',
      expect.objectContaining({
        httpOnly: true,
        path: '/',
        sameSite: 'Lax'
      })
    );

    expect(res.writeHead).toHaveBeenCalledWith(302, { Location: '/dashboard' });
    expect(res.end).toHaveBeenCalled();
  });

  test('showRegister should redirect to dashboard if user already exists in session', async () => {
    req.user = { id: 1, role: 'student' };

    await authController.showRegister(req, res);

    expect(res.writeHead).toHaveBeenCalledWith(302, { Location: '/dashboard' });
    expect(res.end).toHaveBeenCalled();
  });

  test('showRegister should render register page', async () => {
    await authController.showRegister(req, res);

    expect(viewRenderer.render).toHaveBeenCalledWith(
      res,
      'auth/register',
      expect.objectContaining({
        title: 'Register',
        user: null,
        errorMessage: '',
        formValues: {}
      }),
      200
    );
  });

  test('register should render register page with error if registration fails', async () => {
    req.body = {
      full_name: 'Test User',
      login: 'test_user',
      role: 'student',
      password: '123',
      confirm_password: '321'
    };

    authService.register.mockResolvedValue({
      ok: false,
      status: 400,
      message: 'Passwords do not match.'
    });

    await authController.register(req, res);

    expect(authService.register).toHaveBeenCalledWith(req.body);
    expect(viewRenderer.render).toHaveBeenCalledWith(
      res,
      'auth/register',
      expect.objectContaining({
        errorMessage: 'Passwords do not match.',
        formValues: req.body
      }),
      400
    );
  });

  test('register should redirect to login after successful registration', async () => {
    req.body = {
      full_name: 'Test User',
      login: 'test_user',
      role: 'student',
      password: 'student123',
      confirm_password: 'student123'
    };

    authService.register.mockResolvedValue({
      ok: true,
      status: 201,
      user: {
        id: 10,
        full_name: 'Test User',
        login: 'test_user',
        role: 'student'
      }
    });

    await authController.register(req, res);

    expect(res.writeHead).toHaveBeenCalledWith(302, {
      Location: '/login?registered=1'
    });
    expect(res.end).toHaveBeenCalled();
  });

  test('logout should destroy session, clear cookie and redirect', async () => {
    req.user = {
      id: 4,
      login: 'student_anna'
    };
    req.sessionId = 'session-123';

    await authController.logout(req, res);

    expect(sessionManager.destroySession).toHaveBeenCalledWith('session-123');
    expect(CookieHelper.clearCookie).toHaveBeenCalledWith(
      res,
      'sid',
      expect.objectContaining({
        path: '/',
        sameSite: 'Lax'
      })
    );
    expect(res.writeHead).toHaveBeenCalledWith(302, { Location: '/login' });
    expect(res.end).toHaveBeenCalled();
  });
});