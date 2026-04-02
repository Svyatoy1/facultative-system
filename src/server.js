const http = require('http');
const app = require('./app');
const pool = require('./config/db');
const { PORT } = require('./config/env');
const logger = require('./utils/logger');

async function startServer() {
  try {
    await pool.query('SELECT NOW()');
    logger.info('Database connected successfully');

    const server = http.createServer((req, res) => {
      app.handle(req, res);
    });

    server.listen(PORT, () => {
      logger.info('Server started', {
        port: PORT,
        url: `http://localhost:${PORT}`
      });
    });
  } catch (error) {
    logger.error('Failed to connect to database', {
      error: error.message
    });
  }
}

startServer();