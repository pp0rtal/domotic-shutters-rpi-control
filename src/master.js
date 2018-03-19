const EventEmitter = require('events');

const Promise = require('bluebird');
const logger = require('log4js').getLogger();

const executor = require('./executor');
const config = require('../config');
const moves = require('./moves');

const stack = [];
const stackEmitter = new EventEmitter();
let idleTimeout = -1;

/**
 * @param {String} origin Will be logged
 * @param {String[]|Number[]} ids Channel to control
 * @param {String} instruction Action to do
 * @return {*|Promise<T>}
 */
function moveMasterSequence(origin, ids, instruction = 'select') {
  clearTimeout(idleTimeout);

  return Promise.try(() => {
    const move = moves.getMovesInstructions(ids, instruction);
    logger.log('', `${origin} - ${instruction} on ${ids} (${move})`);

    return move;
  })
    .then(move => planifyInstructions(move))
    .then(() => {
      stack.shift();
      stackEmitter.emit('next');

      // Idle detection if channel !== 1
      if (stack.length === 0 && config.controller.channels > 1
        && moves.getChannel() && config.server.idle) {
        idleTimeout = setTimeout(() => {
          logger.log('', 'Idle - reset to channel 1');

          return resetToFirstChannel();
        }, config.server.idle * 1000);
      }
    });
}

/**
 * @return {Promise}
 */
function resetToFirstChannel() {
  return moveMasterSequence('system', [1]);
}

/**
 * Will execute moves when remote command is available
 * @param {number[]} move Move instructions
 * @return {Promise} Resolve when all instructions are executed
 */
function planifyInstructions(move) {
  const job = () => executor.executeInstructionsSequence(move);
  stack.push(job);

  // No concurrency
  if (stack.length === 1) {
    return job();
  }

  return new Promise((resolve, reject) => {
    stackEmitter.on('next', () => {
      if (stack[0] === job) {
        return job()
          .then(resolve)
          .catch(reject);
      }
    })
  });
}

module.exports = {
  moveMasterSequence,
  resetToFirstChannel
};
