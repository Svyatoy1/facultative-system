class AdminService {
  constructor(userDao, courseDao) {
    this.userDao = userDao;
    this.courseDao = courseDao;
  }

  async getAllUsers() {
    return this.userDao.findAll();
  }

  async getAllCourses() {
    return this.courseDao.findAllWithTeacherAndStudentCount();
  }

  async createUser(formData) {
    const { full_name, login, password, confirm_password, role } = formData;

    if (!full_name || !login || !password || !confirm_password || !role) {
      return {
        ok: false,
        status: 400,
        message: 'All fields are required.'
      };
    }

    const normalizedFullName = full_name.trim();
    const normalizedLogin = login.trim();
    const normalizedRole = role.trim();

    if (!['student', 'teacher', 'admin'].includes(normalizedRole)) {
      return {
        ok: false,
        status: 400,
        message: 'Role must be student, teacher, or admin.'
      };
    }

    if (normalizedFullName.length < 3) {
      return {
        ok: false,
        status: 400,
        message: 'Full name must contain at least 3 characters.'
      };
    }

    if (normalizedLogin.length < 3) {
      return {
        ok: false,
        status: 400,
        message: 'Login must contain at least 3 characters.'
      };
    }

    if (password.length < 6) {
      return {
        ok: false,
        status: 400,
        message: 'Password must contain at least 6 characters.'
      };
    }

    if (password !== confirm_password) {
      return {
        ok: false,
        status: 400,
        message: 'Passwords do not match.'
      };
    }

    const existingUser = await this.userDao.findByLogin(normalizedLogin);

    if (existingUser) {
      return {
        ok: false,
        status: 409,
        message: 'User with this login already exists.'
      };
    }

    const user = await this.userDao.createUser({
      full_name: normalizedFullName,
      login: normalizedLogin,
      password,
      role: normalizedRole
    });

    return {
      ok: true,
      status: 201,
      user
    };
  }
}

module.exports = AdminService;