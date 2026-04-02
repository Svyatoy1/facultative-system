const Router = require('./core/router/Router');
const SessionManager = require('./core/session/SessionManager');

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

const userDao = new UserDao();
const courseDao = new CourseDao();
const enrollmentDao = new EnrollmentDao();

const authService = new AuthService(userDao);
const courseService = new CourseService(courseDao, enrollmentDao);
const teacherService = new TeacherService(courseDao, enrollmentDao);

const authController = new AuthController(authService, sessionManager);
const courseController = new CourseController(courseService);
const teacherController = new TeacherController(teacherService);

function requireAuth(req, res) {
  if (!req.user) {
    res.writeHead(302, { Location: '/login' });
    res.end();
    return false;
  }

  return true;
}

function requireRole(req, res, allowedRoles) {
  if (!requireAuth(req, res)) {
    return false;
  }

  if (!allowedRoles.includes(req.user.role)) {
    res.writeHead(403, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`
      <h1>403 Forbidden</h1>
      <p>You do not have access to this page.</p>
      <p><a href="/dashboard">Back to dashboard</a></p>
    `);
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

  let roleLinks = '';

  if (req.user.role === 'student') {
    roleLinks = `
      <li><a href="/courses">All courses</a></li>
      <li><a href="/my-courses">My courses</a></li>
    `;
  } else if (req.user.role === 'teacher') {
    roleLinks = `
      <li><a href="/teacher/courses">My teaching courses</a></li>
    `;
  } else {
    roleLinks = `
      <li>Admin panel will be added later.</li>
    `;
  }

  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(`
    <h1>Dashboard</h1>
    <p>Welcome, ${req.user.full_name}!</p>
    <p>Login: ${req.user.login}</p>
    <p>Role: ${req.user.role}</p>

    <ul>
      ${roleLinks}
    </ul>

    <form method="POST" action="/logout" style="margin-top: 20px;">
      <button type="submit">Logout</button>
    </form>
  `);
});

router.get('/courses', async (req, res) => {
  if (!requireRole(req, res, ['student'])) {
    return;
  }

  await courseController.showAllCourses(req, res);
});

router.post('/courses/:id/enroll', async (req, res) => {
  if (!requireRole(req, res, ['student'])) {
    return;
  }

  await courseController.enroll(req, res);
});

router.get('/my-courses', async (req, res) => {
  if (!requireRole(req, res, ['student'])) {
    return;
  }

  await courseController.showMyCourses(req, res);
});

router.get('/teacher/courses', async (req, res) => {
  if (!requireRole(req, res, ['teacher'])) {
    return;
  }

  await courseController.showTeacherCourses(req, res);
});

router.get('/teacher/courses/:id/students', async (req, res) => {
  if (!requireRole(req, res, ['teacher'])) {
    return;
  }

  await teacherController.showCourseStudents(req, res);
});

router.get('/teacher/enrollments/:id/edit', async (req, res) => {
  if (!requireRole(req, res, ['teacher'])) {
    return;
  }

  await teacherController.showEditEnrollmentForm(req, res);
});

router.post('/teacher/enrollments/:id/update', async (req, res) => {
  if (!requireRole(req, res, ['teacher'])) {
    return;
  }

  await teacherController.updateEnrollment(req, res);
});

router.get('/courses/:id', async (req, res) => {
  if (!requireAuth(req, res)) {
    return;
  }

  res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end(`Course id: ${req.params.id}`);
});

module.exports = {
  handle(req, res) {
    sessionManager.attachSession(req);
    router.handle(req, res);
  }
};