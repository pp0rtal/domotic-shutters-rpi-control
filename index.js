const log4js = require('log4js');
const express = require('express');

const router = require('./src/router');
const config = require('./config');

const app = express();

log4js.configure({
  appenders: {
    console: { type: 'console' }
  },
  categories: {
    default: { appenders: ['console'], level: 'trace' }
  }
});


// Handles open/close/stop instruction on selection
app.use('/:selection/:instruction', router);

// Bad format
app.use(function(req, res, next) {
  res.status(400);
  res.end(JSON.stringify({ error: 'Unexpected Format' }));
});

// Launch server
app.listen(config.server.port, () => {
  console.log(`server listening on ${config.server.port}`);
});
