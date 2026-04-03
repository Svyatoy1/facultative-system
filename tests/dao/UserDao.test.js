jest.mock('../../src/config/db', () => ({
  query: jest.fn()
}));

const pool = require('../../src/config/db');
const UserDao = require('../../src/dao/UserDao');

describe('UserDao', () => {
  let userDao;

  beforeEach(() => {
    userDao = new UserDao();
    jest.clearAllMocks();
  });

  test('findByLogin should return user if found', async () => {
    const mockUser = {
      id: 1,
      full_name: 'Admin User',
      login: 'admin',
      role: 'admin',
      password_hash: 'hashed'
    };

    pool.query.mockResolvedValue({ rows: [mockUser] });

    const result = await userDao.findByLogin('admin');

    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining('FROM users'),
      ['admin']
    );
    expect(result).toEqual(mockUser);
  });

  test('findByLogin should return null if user not found', async () => {
    pool.query.mockResolvedValue({ rows: [] });

    const result = await userDao.findByLogin('missing_user');

    expect(result).toBeNull();
  });

  test('verifyCredentials should return user if credentials are valid', async () => {
    const mockUser = {
      id: 4,
      full_name: 'Анна Мельник',
      login: 'student_anna',
      role: 'student'
    };

    pool.query.mockResolvedValue({ rows: [mockUser] });

    const result = await userDao.verifyCredentials('student_anna', 'student123');

    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining('password_hash = crypt($2, password_hash)'),
      ['student_anna', 'student123']
    );
    expect(result).toEqual(mockUser);
  });

  test('verifyCredentials should return null if credentials are invalid', async () => {
    pool.query.mockResolvedValue({ rows: [] });

    const result = await userDao.verifyCredentials('student_anna', 'wrong');

    expect(result).toBeNull();
  });

  test('createUser should create and return user', async () => {
    const mockCreatedUser = {
      id: 10,
      full_name: 'New Teacher',
      login: 'new_teacher',
      role: 'teacher'
    };

    const payload = {
      full_name: 'New Teacher',
      login: 'new_teacher',
      password: 'teacher123',
      role: 'teacher'
    };

    pool.query.mockResolvedValue({ rows: [mockCreatedUser] });

    const result = await userDao.createUser(payload);

    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO users'),
      ['New Teacher', 'new_teacher', 'teacher123', 'teacher']
    );
    expect(result).toEqual(mockCreatedUser);
  });

  test('findAll should return all users', async () => {
    const mockUsers = [
      { id: 1, full_name: 'Admin User', login: 'admin', role: 'admin' },
      { id: 2, full_name: 'Teacher', login: 'teacher_ivan', role: 'teacher' }
    ];

    pool.query.mockResolvedValue({ rows: mockUsers });

    const result = await userDao.findAll();

    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining('SELECT id, full_name, login, role, created_at')
    );
    expect(result).toEqual(mockUsers);
  });
});