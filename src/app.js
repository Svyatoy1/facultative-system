const Router = require('./core/router/Router');

const router = new Router();

router.get('/', async (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Facultative System is running');
});

router.get('/login', async (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(`
    <h1>Login page</h1>
    <form method="POST" action="/login">
      <div>
        <label>Login:</label>
        <input type="text" name="login" />
      </div>
      <div>
        <label>Password:</label>
        <input type="password" name="password" />
      </div>
      <button type="submit">Sign in</button>
    </form>
  `);
});

router.post('/login', async (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('POST /login works');
});

router.get('/courses/:id', async (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end(`Course id: ${req.params.id}`);
});

module.exports = {
  handle(req, res) {
    router.handle(req, res);
  }
};