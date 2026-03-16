const http = require('http');
const app = require('./app');
const pool = require('./config/db');
const { PORT } = require('./config/env');

async function startServer() {
  try {
    await pool.query('SELECT NOW()');
    console.log('Database connected successfully');

    const server = http.createServer((req, res) => {
      app.handle(req, res);
    });

    server.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to connect to database:', error.message);
  }
}

startServer();