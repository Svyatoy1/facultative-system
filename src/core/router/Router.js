class Router {
  constructor() {
    this.routes = [];
  }

  register(method, path, handler) {
    const { regex, paramNames } = this.#buildPathRegex(path);

    this.routes.push({
      method: method.toUpperCase(),
      path,
      handler,
      regex,
      paramNames
    });
  }

  get(path, handler) {
    this.register('GET', path, handler);
  }

  post(path, handler) {
    this.register('POST', path, handler);
  }

  async handle(req, res) {
    try {
      const url = new URL(req.url, 'http://localhost:3000');
      const pathname = url.pathname;
      const method = req.method.toUpperCase();

      const matchedRoute = this.routes.find((route) => {
        return route.method === method && route.regex.test(pathname);
      });

      if (!matchedRoute) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('404 Not Found');
        return;
      }

      const match = pathname.match(matchedRoute.regex);
      const params = {};

      if (match) {
        matchedRoute.paramNames.forEach((paramName, index) => {
          params[paramName] = match[index + 1];
        });
      }

      req.params = params;
      req.query = Object.fromEntries(url.searchParams.entries());

      await matchedRoute.handler(req, res);
    } catch (error) {
      console.error('Router error:', error);

      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('500 Internal Server Error');
    }
  }

  #buildPathRegex(path) {
    const paramNames = [];

    const regexPath = path
      .replace(/\/:([^/]+)/g, (_, paramName) => {
        paramNames.push(paramName);
        return '/([^/]+)';
      })
      .replace(/\//g, '\\/');

    const regex = new RegExp(`^${regexPath}$`);

    return { regex, paramNames };
  }
}

module.exports = Router;