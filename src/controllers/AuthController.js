class AuthController {
  constructor(authService) {
    this.authService = authService;
  }

  async showLogin(req, res) {
    this.#renderLoginForm(res);
  }

  async login(req, res) {
    const { login, password } = req.body;

    const result = await this.authService.login(login, password);

    if (!result.ok) {
      this.#renderLoginForm(res, result.message, result.status);
      return;
    }

    const { user } = result;

    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`
      <h1>Login successful</h1>
      <p>Welcome, ${user.full_name}!</p>
      <p>Your role: ${user.role}</p>
      <p>This is a temporary success page. Session and redirect will be added next.</p>
      <p><a href="/login">Back to login</a></p>
    `);
  }

  #renderLoginForm(res, errorMessage = '', statusCode = 200) {
    res.writeHead(statusCode, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`
      <h1>Login page</h1>

      ${errorMessage ? `<p style="color:red;">${errorMessage}</p>` : ''}

      <form method="POST" action="/login">
        <div style="margin-bottom:10px;">
          <label for="login">Login:</label><br />
          <input id="login" type="text" name="login" />
        </div>

        <div style="margin-bottom:10px;">
          <label for="password">Password:</label><br />
          <input id="password" type="password" name="password" />
        </div>

        <button type="submit">Sign in</button>
      </form>
    `);
  }
}

module.exports = AuthController;