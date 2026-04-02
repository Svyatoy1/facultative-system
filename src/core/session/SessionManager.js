const { randomUUID } = require('crypto');
const CookieHelper = require('./CookieHelper');

class SessionManager {
  constructor() {
    this.sessions = new Map();
    this.cookieName = 'sid';
  }

  attachSession(req) {
    const cookies = CookieHelper.parse(req.headers.cookie || '');
    const sessionId = cookies[this.cookieName];

    if (!sessionId) {
      req.sessionId = null;
      req.session = null;
      req.user = null;
      return;
    }

    const session = this.sessions.get(sessionId) || null;

    req.sessionId = sessionId;
    req.session = session;
    req.user = session ? session.user : null;
  }

  createSession(user) {
    const sessionId = randomUUID();

    const sessionData = {
      id: sessionId,
      user: {
        id: user.id,
        full_name: user.full_name,
        login: user.login,
        role: user.role
      },
      createdAt: new Date().toISOString()
    };

    this.sessions.set(sessionId, sessionData);

    return sessionId;
  }

  getSession(sessionId) {
    return this.sessions.get(sessionId) || null;
  }

  destroySession(sessionId) {
    if (!sessionId) {
      return;
    }

    this.sessions.delete(sessionId);
  }
}

module.exports = SessionManager;