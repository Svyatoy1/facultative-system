const fs = require('fs');
const path = require('path');

class Logger {
  constructor() {
    this.logsDir = path.join(process.cwd(), 'logs');
    this.logFilePath = path.join(this.logsDir, 'app.log');

    if (!fs.existsSync(this.logsDir)) {
      fs.mkdirSync(this.logsDir, { recursive: true });
    }
  }

  format(level, message, meta = {}) {
    const timestamp = new Date().toISOString();

    return JSON.stringify({
      timestamp,
      level,
      message,
      ...meta
    });
  }

  write(level, message, meta = {}) {
    const line = this.format(level, message, meta);

    console.log(line);
    fs.appendFileSync(this.logFilePath, line + '\n', 'utf8');
  }

  info(message, meta = {}) {
    this.write('INFO', message, meta);
  }

  warn(message, meta = {}) {
    this.write('WARN', message, meta);
  }

  error(message, meta = {}) {
    this.write('ERROR', message, meta);
  }
}

module.exports = new Logger();