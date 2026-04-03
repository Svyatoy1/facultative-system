jest.mock('../../src/utils/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
}));

const AdminController = require('../../src/controllers/AdminController');

describe('AdminController', () => {
  let adminService;
  let viewRenderer;
  let adminController;
  let req;
  let res;

  beforeEach(() => {
    adminService = {
      getAllUsers: jest.fn(),
      getAllCourses: jest.fn(),
      createUser: jest.fn()
    };

    viewRenderer = {
      render: jest.fn()
    };

    adminController = new AdminController(adminService, viewRenderer);

    req = {
      user: {
        id: 1,
        role: 'admin',
        full_name: 'Admin User',
        login: 'admin'
      },
      body: {}
    };

    res = {
      writeHead: jest.fn(),
      end: jest.fn()
    };

    jest.clearAllMocks();
  });

  test('showUsers should render all users page', async () => {
    const mockUsers = [
      { id: 1, full_name: 'Admin User', login: 'admin', role: 'admin' }
    ];

    adminService.getAllUsers.mockResolvedValue(mockUsers);

    await adminController.showUsers(req, res);

    expect(viewRenderer.render).toHaveBeenCalledWith(
      res,
      'admin/users',
      expect.objectContaining({
        title: 'All Users',
        users: mockUsers
      })
    );
  });

  test('showCreateUserForm should render create-user page', async () => {
    await adminController.showCreateUserForm(req, res);

    expect(viewRenderer.render).toHaveBeenCalledWith(
      res,
      'admin/create-user',
      expect.objectContaining({
        title: 'Create User',
        errorMessage: '',
        formValues: {}
      })
    );
  });

  test('createUser should re-render form with error on failure', async () => {
    req.body = {
      full_name: 'Test',
      login: 'test_user',
      role: 'student',
      password: '123',
      confirm_password: '321'
    };

    adminService.createUser.mockResolvedValue({
      ok: false,
      status: 400,
      message: 'Passwords do not match.'
    });

    await adminController.createUser(req, res);

    expect(viewRenderer.render).toHaveBeenCalledWith(
      res,
      'admin/create-user',
      expect.objectContaining({
        errorMessage: 'Passwords do not match.',
        formValues: req.body
      }),
      400
    );
  });

  test('createUser should redirect on success', async () => {
    req.body = {
      full_name: 'New Teacher',
      login: 'new_teacher',
      role: 'teacher',
      password: 'teacher123',
      confirm_password: 'teacher123'
    };

    adminService.createUser.mockResolvedValue({
      ok: true,
      status: 201,
      user: {
        id: 10,
        full_name: 'New Teacher',
        login: 'new_teacher',
        role: 'teacher'
      }
    });

    await adminController.createUser(req, res);

    expect(res.writeHead).toHaveBeenCalledWith(302, {
      Location: '/admin/users'
    });
    expect(res.end).toHaveBeenCalled();
  });

  test('showCourses should render all courses page', async () => {
    const mockCourses = [
      {
        id: 1,
        title: 'Web Development Basics',
        teacher_name: 'Іван Петренко',
        student_count: 3
      }
    ];

    adminService.getAllCourses.mockResolvedValue(mockCourses);

    await adminController.showCourses(req, res);

    expect(viewRenderer.render).toHaveBeenCalledWith(
      res,
      'admin/courses',
      expect.objectContaining({
        title: 'All Courses',
        courses: mockCourses
      })
    );
  });
});