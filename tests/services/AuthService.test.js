const AuthService = require('../../src/services/AuthService');

describe('AuthService', () => {
  let userDao;
  let authService;

  beforeEach(() => {
    userDao = {
      verifyCredentials: jest.fn()
    };

    authService = new AuthService(userDao);
  });

  test('should return 400 if login or password is missing', async () => {
    const result = await authService.login('', '');

    expect(result).toEqual({
      ok: false,
      status: 400,
      message: 'Login and password are required.'
    });

    expect(userDao.verifyCredentials).not.toHaveBeenCalled();
  });

  test('should return 401 if credentials are invalid', async () => {
    userDao.verifyCredentials.mockResolvedValue(null);

    const result = await authService.login('student_anna', 'wrong_password');

    expect(userDao.verifyCredentials).toHaveBeenCalledWith(
      'student_anna',
      'wrong_password'
    );

    expect(result).toEqual({
      ok: false,
      status: 401,
      message: 'Invalid login or password.'
    });
  });

  test('should return success if credentials are valid', async () => {
    const mockUser = {
      id: 4,
      full_name: 'Анна Мельник',
      login: 'student_anna',
      role: 'student'
    };

    userDao.verifyCredentials.mockResolvedValue(mockUser);

    const result = await authService.login('student_anna', 'student123');

    expect(userDao.verifyCredentials).toHaveBeenCalledWith(
      'student_anna',
      'student123'
    );

    expect(result).toEqual({
      ok: true,
      status: 200,
      user: mockUser
    });
  });

  test('should trim login before verification', async () => {
    userDao.verifyCredentials.mockResolvedValue(null);

    await authService.login('  student_anna  ', 'student123');

    expect(userDao.verifyCredentials).toHaveBeenCalledWith(
      'student_anna',
      'student123'
    );
  });
});