const Router = require('./core/router/Router');
const SessionManager = require('./core/session/SessionManager');
const ViewRenderer = require('./core/view/ViewRenderer');

const UserDao = require('./dao/UserDao');
const CourseDao = require('./dao/CourseDao');
const EnrollmentDao = require('./dao/EnrollmentDao');

const AuthService = require('./services/AuthService');
const CourseService = require('./services/CourseService');
const TeacherService = require('./services/TeacherService');

const AuthController = require('./controllers/AuthController');
const CourseController = require('./controllers/CourseController');
const TeacherController = require('./controllers/TeacherController');

const router = new Router();
const sessionManager = new SessionManager();
const viewRenderer = new ViewRenderer();

const userDao = new UserDao();
const courseDao = new CourseDao();
const enrollmentDao = new EnrollmentDao();

const authService = new AuthService(userDao);
const courseService = new CourseService(courseDao, enrollmentDao);
const teacherService = new TeacherService(courseDao, enrollmentDao);

const authController = new AuthController(
  authService,
  sessionManager,
  viewRenderer
);
const courseController = new CourseController(courseService, viewRenderer);
const teacherController = new TeacherController(teacherService, viewRenderer);

function requireAuth(req, res) {
  if (!req.user) {
    res.writeHead(302, { Location: '/login' });
    res.end();
    return false;
  }

  return true;
}

async function requireRole(req, res, allowedRoles) {
  if (!requireAuth(req, res)) {
    return false;
  }

  if (!allowedRoles.includes(req.user.role)) {
    await viewRenderer.render(
      res,
      'error',
      {
        title: '403 Forbidden',
        user: req.user,
        heading: '403 Forbidden',
        message: 'You do not have access to this page.',
        backHref: '/dashboard',
        backLabel: 'Back to dashboard'
      },
      403
    );

    return false;
  }

  return true;
}

router.get('/', async (req, res) => {
  if (req.user) {
    res.writeHead(302, { Location: '/dashboard' });
    res.end();
    return;
  }

  res.writeHead(302, { Location: '/login' });
  res.end();
});

router.get('/login', authController.showLogin.bind(authController));
router.post('/login', authController.login.bind(authController));
router.post('/logout', authController.logout.bind(authController));

router.get('/dashboard', async (req, res) => {
  if (!requireAuth(req, res)) {
    return;
  }

  await viewRenderer.render(res, 'dashboard', {
    title: 'Dashboard',
    user: req.user
  });
});

router.get('/courses', async (req, res) => {
  if (!(await requireRole(req, res, ['student']))) {
    return;
  }

  await courseController.showAllCourses(req, res);
});

router.post('/courses/:id/enroll', async (req, res) => {
  if (!(await requireRole(req, res, ['student']))) {
    return;
  }

  await courseController.enroll(req, res);
});

router.get('/my-courses', async (req, res) => {
  if (!(await requireRole(req, res, ['student']))) {
    return;
  }

  await courseController.showMyCourses(req, res);
});

router.get('/teacher/courses', async (req, res) => {
  if (!(await requireRole(req, res, ['teacher']))) {
    return;
  }

  await courseController.showTeacherCourses(req, res);
});

router.get('/teacher/courses/:id/students', async (req, res) => {
  if (!(await requireRole(req, res, ['teacher']))) {
    return;
  }

  await teacherController.showCourseStudents(req, res);
});

router.get('/teacher/enrollments/:id/edit', async (req, res) => {
  if (!(await requireRole(req, res, ['teacher']))) {
    return;
  }

  await teacherController.showEditEnrollmentForm(req, res);
});

router.post('/teacher/enrollments/:id/update', async (req, res) => {
  if (!(await requireRole(req, res, ['teacher']))) {
    return;
  }

  await teacherController.updateEnrollment(req, res);
});

router.get('/courses/:id', async (req, res) => {
  if (!requireAuth(req, res)) {
    return;
  }

  await viewRenderer.render(res, 'error', {
    title: 'Course Page',
    user: req.user,
    heading: 'Course page',
    message: `Temporary route. Course id: ${req.params.id}`,
    backHref: '/dashboard',
    backLabel: 'Back to dashboard'
  });
});

module.exports = {
  handle(req, res) {
    sessionManager.attachSession(req);
    router.handle(req, res);
  }
};