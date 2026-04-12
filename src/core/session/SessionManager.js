const { randomUUID } = require('crypto');
const CookieHelper = require('./CookieHelper');

class SessionManager {
  constructor() {
    this.sessions = new Map();

    this.zoneConfig = {
      student: {
        cookieName: 'student_sid',
        path: '/student'
      },
      teacher: {
        cookieName: 'teacher_sid',
        path: '/teacher'
      },
      admin: {
        cookieName: 'admin_sid',
        path: '/admin'
      }
    };
  }

  resolveZone(pathname) {
    if (pathname.startsWith('/student')) {
      return 'student';
    }

    if (pathname.startsWith('/teacher')) {
      return 'teacher';
    }

    if (pathname.startsWith('/admin')) {
      return 'admin';
    }

    return null;
  }

  attachSession(req) {
    const url = new URL(req.url, 'http://localhost:3000');
    const zone = this.resolveZone(url.pathname);

    req.authZone = zone;
    req.sessionId = null;
    req.session = null;
    req.user = null;

    if (!zone) {
      return;
    }

    const config = this.zoneConfig[zone];
    const cookies = CookieHelper.parse(req.headers.cookie || '');
    const sessionId = cookies[config.cookieName];

    if (!sessionId) {
      return;
    }

    const session = this.sessions.get(sessionId);

    if (!session || session.zone !== zone) {
      return;
    }

    req.sessionId = sessionId;
    req.session = session;
    req.user = session.user;
  }

  createSession(user, zone) {
    const sessionId = randomUUID();

    const sessionData = {
      id: sessionId,
      zone,
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

  destroySession(sessionId) {
    if (!sessionId) {
      return;
    }

    this.sessions.delete(sessionId);
  }

  getCookieConfig(zone) {
    return this.zoneConfig[zone] || null;
  }

  getCookieOptions(zone) {
    const config = this.getCookieConfig(zone);

    if (!config) {
      return null;
    }

    return {
      httpOnly: true,
      path: config.path,
      sameSite: 'Lax',
      maxAge: 60 * 60 * 24
    };
  }
}

module.exports = SessionManager;