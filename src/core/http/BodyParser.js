class BodyParser {
  static parse(req) {
    return new Promise((resolve, reject) => {
      const method = req.method.toUpperCase();

      if (method === 'GET' || method === 'HEAD') {
        req.body = {};
        resolve(req.body);
        return;
      }

      let rawBody = '';

      req.on('data', (chunk) => {
        rawBody += chunk.toString();
      });

      req.on('end', () => {
        const contentType = req.headers['content-type'] || '';

        if (!rawBody) {
          req.body = {};
          resolve(req.body);
          return;
        }

        if (contentType.includes('application/x-www-form-urlencoded')) {
          const params = new URLSearchParams(rawBody);
          req.body = Object.fromEntries(params.entries());
          resolve(req.body);
          return;
        }

        req.body = { raw: rawBody };
        resolve(req.body);
      });

      req.on('error', (error) => {
        reject(error);
      });
    });
  }
}

module.exports = BodyParser;