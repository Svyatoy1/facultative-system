class CookieHelper {
  static parse(cookieHeader = '') {
    if (!cookieHeader) {
      return {};
    }

    return cookieHeader.split(';').reduce((acc, pair) => {
      const [rawName, ...rawValueParts] = pair.trim().split('=');

      if (!rawName) {
        return acc;
      }

      const name = decodeURIComponent(rawName);
      const value = decodeURIComponent(rawValueParts.join('=') || '');

      acc[name] = value;
      return acc;
    }, {});
  }

  static setCookie(res, name, value, options = {}) {
    const parts = [`${encodeURIComponent(name)}=${encodeURIComponent(value)}`];

    if (options.maxAge !== undefined) {
      parts.push(`Max-Age=${options.maxAge}`);
    }

    if (options.path) {
      parts.push(`Path=${options.path}`);
    }

    if (options.httpOnly) {
      parts.push('HttpOnly');
    }

    if (options.sameSite) {
      parts.push(`SameSite=${options.sameSite}`);
    }

    if (options.secure) {
      parts.push('Secure');
    }

    const cookieString = parts.join('; ');
    const existing = res.getHeader('Set-Cookie');

    if (!existing) {
      res.setHeader('Set-Cookie', cookieString);
      return;
    }

    if (Array.isArray(existing)) {
      res.setHeader('Set-Cookie', [...existing, cookieString]);
      return;
    }

    res.setHeader('Set-Cookie', [existing, cookieString]);
  }

  static clearCookie(res, name, options = {}) {
    this.setCookie(res, name, '', {
      ...options,
      maxAge: 0
    });
  }
}

module.exports = CookieHelper;