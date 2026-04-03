const EventEmitter = require('events');
const BodyParser = require('../../../src/core/http/BodyParser');

class MockRequest extends EventEmitter {
  constructor(method = 'GET', headers = {}) {
    super();
    this.method = method;
    this.headers = headers;
    this.body = undefined;
  }
}

describe('BodyParser', () => {
  test('should return empty object for GET request', async () => {
    const req = new MockRequest('GET');

    const result = await BodyParser.parse(req);

    expect(result).toEqual({});
    expect(req.body).toEqual({});
  });

  test('should return empty object for HEAD request', async () => {
    const req = new MockRequest('HEAD');

    const result = await BodyParser.parse(req);

    expect(result).toEqual({});
    expect(req.body).toEqual({});
  });

  test('should parse application/x-www-form-urlencoded body', async () => {
    const req = new MockRequest('POST', {
      'content-type': 'application/x-www-form-urlencoded'
    });

    const parsePromise = BodyParser.parse(req);

    req.emit('data', Buffer.from('login=student_anna&password=student123'));
    req.emit('end');

    const result = await parsePromise;

    expect(result).toEqual({
      login: 'student_anna',
      password: 'student123'
    });

    expect(req.body).toEqual({
      login: 'student_anna',
      password: 'student123'
    });
  });

  test('should return empty object for POST request with empty body', async () => {
    const req = new MockRequest('POST', {
      'content-type': 'application/x-www-form-urlencoded'
    });

    const parsePromise = BodyParser.parse(req);

    req.emit('end');

    const result = await parsePromise;

    expect(result).toEqual({});
    expect(req.body).toEqual({});
  });

  test('should return raw body for unsupported content-type', async () => {
    const req = new MockRequest('POST', {
      'content-type': 'text/plain'
    });

    const parsePromise = BodyParser.parse(req);

    req.emit('data', Buffer.from('plain text body'));
    req.emit('end');

    const result = await parsePromise;

    expect(result).toEqual({
      raw: 'plain text body'
    });

    expect(req.body).toEqual({
      raw: 'plain text body'
    });
  });

  test('should reject if request emits error', async () => {
    const req = new MockRequest('POST', {
      'content-type': 'application/x-www-form-urlencoded'
    });

    const parsePromise = BodyParser.parse(req);

    req.emit('error', new Error('Stream error'));

    await expect(parsePromise).rejects.toThrow('Stream error');
  });
});