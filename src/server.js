const http = require('http');
const app = require('./app');
const { PORT } = require('./config/env');

const server = http.createServer((req, res) => {
  app.handle(req, res);
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});