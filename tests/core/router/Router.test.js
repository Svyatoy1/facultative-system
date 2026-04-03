const Router = require('../../../src/core/router/Router');
const BodyParser = require('../../../src/core/http/BodyParser');

jest.mock('../../../src/core/http/BodyParser', () => ({
  parse: jest.fn()
}));

describe('Router', () => {
  let router;
  let req;
  let res;

  beforeEach(() => {
    router = new Router();

    req = {
      method: 'GET',
      url: '/',
      headers: {}
    };

    res = {
      writeHead: jest.fn(),
      end: jest.fn()
    };

    BodyParser.parse.mockResolvedValue({});
  });

  test('should handle GET route successfully', async () => {
    const handler = jest.fn(async (_req, _res) => {
      _res.writeHead(200, { 'Content-Type': 'text/plain' });
      _res.end('OK');
    });

    router.get('/', handler);

    await router.handle(req, res);

    expect(handler).toHaveBeenCalledTimes(1);
    expect(BodyParser.parse).toHaveBeenCalledWith(req);
    expect(res.writeHead).toHaveBeenCalledWith(200, {
      'Content-Type': 'text/plain'
    });
    expect(res.end).toHaveBeenCalledWith('OK');
  });

  test('should handle POST route successfully', async () => {
    req.method = 'POST';
    req.url = '/login';

    const handler = jest.fn(async (_req, _res) => {
      _res.writeHead(200, { 'Content-Type': 'text/plain' });
      _res.end('POST OK');
    });

    router.post('/login', handler);

    await router.handle(req, res);

    expect(handler).toHaveBeenCalledTimes(1);
    expect(BodyParser.parse).toHaveBeenCalledWith(req);
    expect(res.end).toHaveBeenCalledWith('POST OK');
  });

  test('should parse route params correctly', async () => {
    req.method = 'GET';
    req.url = '/courses/15';

    const handler = jest.fn(async (_req, _res) => {
      _res.writeHead(200, { 'Content-Type': 'text/plain' });
      _res.end(`Course ${_req.params.id}`);
    });

    router.get('/courses/:id', handler);

    await router.handle(req, res);

    expect(handler).toHaveBeenCalledTimes(1);
    expect(req.params).toEqual({ id: '15' });
    expect(res.end).toHaveBeenCalledWith('Course 15');
  });

  test('should parse query params correctly', async () => {
    req.method = 'GET';
    req.url = '/courses/15?tab=students&sort=asc';

    const handler = jest.fn(async (_req, _res) => {
      _res.writeHead(200, { 'Content-Type': 'application/json' });
      _res.end(JSON.stringify(_req.query));
    });

    router.get('/courses/:id', handler);

    await router.handle(req, res);

    expect(req.params).toEqual({ id: '15' });
    expect(req.query).toEqual({
      tab: 'students',
      sort: 'asc'
    });
  });

  test('should return 404 if route is not found', async () => {
    req.method = 'GET';
    req.url = '/unknown';

    await router.handle(req, res);

    expect(res.writeHead).toHaveBeenCalledWith(404, {
      'Content-Type': 'text/plain; charset=utf-8'
    });
    expect(res.end).toHaveBeenCalledWith('404 Not Found');
  });

  test('should return 500 if handler throws error', async () => {
    req.method = 'GET';
    req.url = '/broken';

    const handler = jest.fn(async () => {
      throw new Error('Something went wrong');
    });

    router.get('/broken', handler);

    await router.handle(req, res);

    expect(res.writeHead).toHaveBeenCalledWith(500, {
      'Content-Type': 'text/plain; charset=utf-8'
    });
    expect(res.end).toHaveBeenCalledWith('500 Internal Server Error');
  });
});