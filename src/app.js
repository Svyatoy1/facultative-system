const Router = require('./core/router/Router');
const UserDao = require('./dao/UserDao');
const AuthService = require('./services/AuthService');
const AuthController = require('./controllers/AuthController');

const router = new Router();

const userDao = new UserDao();
const authService = new AuthService(userDao);
const authController = new AuthController(authService);

router.get('/', async (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(`
    <h1>Facultative System</h1>
    <p>Application is running.</p>
    <p><a href="/login">Go to login</a></p>
  `);
});

router.get('/login', authController.showLogin.bind(authController));
router.post('/login', authController.login.bind(authController));

router.get('/courses/:id', async (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end(`Course id: ${req.params.id}`);
});

module.exports = {
  handle(req, res) {
    router.handle(req, res);
  }
};