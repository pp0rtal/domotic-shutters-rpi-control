const log4js = require('log4js');
const express = require('express');
const executor = require('./src/remote');

const router = require('./src/middleware');
const master = require('./src/master');
const config = require('./config');

const app = express();

log4js.configure({
  appenders: { console: { type: 'console' } },
  categories: { default: { appenders: ['console'], level: 'trace' } }
});

const logger = log4js.getLogger();

// Reset to channel 1 and clear GPIOs
process.on('SIGINT', function() {
  logger.log('', `back to channel 1`);

  return master.resetToFirstChannel()
    .then(() => logger.log('', 'clear GPIOs'))
    .then(() => executor.closeGPIO())
    .then(() => process.exit());
});

if(config.server.simulate){
  logger.error('', 'Simulation mode, if you are on a real PI, set your config/config.js with main.simulate to false');
}

// Init GPIOs
logger.info('', `init GPIOs`);
executor.initGPIO()
  .then(() => {
    // Handles open/close/stop instruction on selection
    app.use('/:selection/:instruction', router);

    // Bad format
    app.use(function(req, res) {
      res.status(400);
      res.end(JSON.stringify({ error: 'Unexpected Format' }));
    });

    // Launch server
    app.listen(config.server.port, config.server.hostname, () => {
      logger.log('', `server listening on ${config.server.port}`);
    });
  });
