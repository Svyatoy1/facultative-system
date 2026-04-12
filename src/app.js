const Router = require('./core/router/Router');
const SessionManager = require('./core/session/SessionManager');
const ViewRenderer = require('./core/view/ViewRenderer');

const UserDao = require('./dao/UserDao');
const CourseDao = require('./dao/CourseDao');
const EnrollmentDao = require('./dao/EnrollmentDao');

const AuthService = require('./services/AuthService');
const CourseService = require('./services/CourseService');
const TeacherService = require('./services/TeacherService');
const AdminService = require('./services/AdminService');

const AuthController = require('./controllers/AuthController');
const CourseController = require('./controllers/CourseController');
const TeacherController = require('./controllers/TeacherController');
const AdminController = require('./controllers/AdminController');

const router = new Router();
const sessionManager = new SessionManager();
const viewRenderer = new ViewRenderer();

const userDao = new UserDao();
const courseDao = new CourseDao();
const enrollmentDao = new EnrollmentDao();

const authService = new AuthService(userDao);
const courseService = new CourseService(courseDao, enrollmentDao);
const teacherService = new TeacherService(courseDao, enrollmentDao);
const adminService = new AdminService(userDao, courseDao);

const authController = new AuthController(
  authService,
  sessionManager,
  viewRenderer
);
const courseController = new CourseController(courseService, viewRenderer);
const teacherController = new TeacherController(teacherService, viewRenderer);
const adminController = new AdminController(adminService, viewRenderer);

function requireZoneRole(req, res, expectedRole) {
  if (!req.user) {
    res.writeHead(302, { Location: `/${expectedRole}/login` });
    res.end();
    return false;
  }

  if (req.user.role !== expectedRole) {
    res.writeHead(403, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`
      <h1>403 Forbidden</h1>
      <p>You do not have access to this area.</p>
    `);
    return false;
  }

  return true;
}

router.get('/', async (req, res) => {
  await viewRenderer.render(res, 'home', {
    title: 'Facultative System',
    user: null
  });
});

router.get('/student/login', authController.showLogin.bind(authController));
router.post('/student/login', authController.login.bind(authController));
router.post('/student/logout', authController.logout.bind(authController));

router.get('/teacher/login', authController.showLogin.bind(authController));
router.post('/teacher/login', authController.login.bind(authController));
router.post('/teacher/logout', authController.logout.bind(authController));

router.get('/admin/login', authController.showLogin.bind(authController));
router.post('/admin/login', authController.login.bind(authController));
router.post('/admin/logout', authController.logout.bind(authController));

router.get('/register', authController.showRegister.bind(authController));
router.post('/register', authController.register.bind(authController));

router.get('/student/dashboard', async (req, res) => {
  if (!requireZoneRole(req, res, 'student')) {
    return;
  }

  await viewRenderer.render(res, 'dashboard', {
    title: 'Student Dashboard',
    user: req.user
  });
});

router.get('/teacher/dashboard', async (req, res) => {
  if (!requireZoneRole(req, res, 'teacher')) {
    return;
  }

  await viewRenderer.render(res, 'dashboard', {
    title: 'Teacher Dashboard',
    user: req.user
  });
});

router.get('/admin/dashboard', async (req, res) => {
  if (!requireZoneRole(req, res, 'admin')) {
    return;
  }

  await viewRenderer.render(res, 'dashboard', {
    title: 'Admin Dashboard',
    user: req.user
  });
});

router.get('/student/courses', async (req, res) => {
  if (!requireZoneRole(req, res, 'student')) {
    return;
  }

  await courseController.showAllCourses(req, res);
});

router.post('/student/courses/:id/enroll', async (req, res) => {
  if (!requireZoneRole(req, res, 'student')) {
    return;
  }

  await courseController.enroll(req, res);
});

router.get('/student/my-courses', async (req, res) => {
  if (!requireZoneRole(req, res, 'student')) {
    return;
  }

  await courseController.showMyCourses(req, res);
});

router.get('/teacher/courses', async (req, res) => {
  if (!requireZoneRole(req, res, 'teacher')) {
    return;
  }

  await courseController.showTeacherCourses(req, res);
});

router.get('/teacher/courses/create', async (req, res) => {
  if (!requireZoneRole(req, res, 'teacher')) {
    return;
  }

  await courseController.showCreateTeacherCourseForm(req, res);
});

router.post('/teacher/courses/create', async (req, res) => {
  if (!requireZoneRole(req, res, 'teacher')) {
    return;
  }

  await courseController.createCourseByTeacher(req, res);
});

router.get('/teacher/courses/:id/students', async (req, res) => {
  if (!requireZoneRole(req, res, 'teacher')) {
    return;
  }

  await teacherController.showCourseStudents(req, res);
});

router.get('/teacher/enrollments/:id/edit', async (req, res) => {
  if (!requireZoneRole(req, res, 'teacher')) {
    return;
  }

  await teacherController.showEditEnrollmentForm(req, res);
});

router.post('/teacher/enrollments/:id/update', async (req, res) => {
  if (!requireZoneRole(req, res, 'teacher')) {
    return;
  }

  await teacherController.updateEnrollment(req, res);
});

router.get('/admin/users', async (req, res) => {
  if (!requireZoneRole(req, res, 'admin')) {
    return;
  }

  await adminController.showUsers(req, res);
});

router.get('/admin/users/create', async (req, res) => {
  if (!requireZoneRole(req, res, 'admin')) {
    return;
  }

  await adminController.showCreateUserForm(req, res);
});

router.post('/admin/users/create', async (req, res) => {
  if (!requireZoneRole(req, res, 'admin')) {
    return;
  }

  await adminController.createUser(req, res);
});

router.get('/admin/courses', async (req, res) => {
  if (!requireZoneRole(req, res, 'admin')) {
    return;
  }

  await adminController.showCourses(req, res);
});

module.exports = {
  handle(req, res) {
    sessionManager.attachSession(req);
    router.handle(req, res);
  }
};