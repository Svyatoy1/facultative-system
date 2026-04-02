const Router = require('./core/router/Router');
const SessionManager = require('./core/session/SessionManager');
const UserDao = require('./dao/UserDao');
const AuthService = require('./services/AuthService');
const AuthController = require('./controllers/AuthController');

const router = new Router();
const sessionManager = new SessionManager();

const userDao = new UserDao();
const authService = new AuthService(userDao);
const authController = new AuthController(authService, sessionManager);

function requireAuth(req, res) {
  if (!req.user) {
    res.writeHead(302, { Location: '/login' });
    res.end();
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

  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(`
    <h1>Dashboard</h1>
    <p>Welcome, ${req.user.full_name}!</p>
    <p>Login: ${req.user.login}</p>
    <p>Role: ${req.user.role}</p>

    <form method="POST" action="/logout" style="margin-top: 20px;">
      <button type="submit">Logout</button>
    </form>
  `);
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