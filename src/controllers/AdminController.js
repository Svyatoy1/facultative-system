const logger = require('../utils/logger');

class AdminController {
  constructor(adminService, viewRenderer) {
    this.adminService = adminService;
    this.viewRenderer = viewRenderer;
  }

  async showUsers(req, res) {
    const users = await this.adminService.getAllUsers();

    await this.viewRenderer.render(res, 'admin/users', {
      title: 'All Users',
      user: req.user,
      users
    });
  }

  async showCreateUserForm(req, res) {
    await this.viewRenderer.render(res, 'admin/create-user', {
      title: 'Create User',
      user: req.user,
      errorMessage: '',
      formValues: {}
    });
  }

  async createUser(req, res) {
    const result = await this.adminService.createUser(req.body);

    if (!result.ok) {
      logger.warn('Admin user creation failed', {
        adminId: req.user.id,
        login: req.body.login || null,
        reason: result.message
      });

      await this.viewRenderer.render(
        res,
        'admin/create-user',
        {
          title: 'Create User',
          user: req.user,
          errorMessage: result.message,
          formValues: req.body
        },
        result.status
      );
      return;
    }

    logger.info('Admin created user', {
      adminId: req.user.id,
      createdUserId: result.user.id,
      login: result.user.login,
      role: result.user.role
    });

    res.writeHead(302, { Location: '/admin/users' });
    res.end();
  }

  async showCourses(req, res) {
    const courses = await this.adminService.getAllCourses();

    await this.viewRenderer.render(res, 'admin/courses', {
      title: 'All Courses',
      user: req.user,
      courses
    });
  }
}

module.exports = AdminController;