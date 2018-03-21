const EventEmitter = require('events');

const Promise = require('bluebird');
const logger = require('log4js').getLogger();

const executor = require('./remote');
const config = require('../config');
const moves = require('./moves');

const stack = [];
const stackEmitter = new EventEmitter();
let idleRemoteTimeout = -1;

/**
 * @param {String} origin Will be logged
 * @param {String[]|Number[]} ids Channel to control
 * @param {String} instruction Action to do
 * @param {number} stopDelay Stop delay
 * @return {*|Promise<T>}
 */
function moveMasterSequence(origin, ids, instruction = 'select', stopDelay = 0) {
  clearTimeout(idleRemoteTimeout);
  let stopTimeout = false;
  let move = [];

  return Promise.try(() => {
    move = moves.getMovesInstructions(ids, instruction);
    logger.log('', `${origin} - ${instruction} on ${ids} (${move}) ${stopDelay ? 'delay=' + stopDelay + 'ms' : ''}`);

    return move;
  })
    .then(() => waitSteadyRemote(move))
    .then(() => executor.executeInstructionsSequence(move))
    .then(() => {
      stack.shift();
      stackEmitter.emit('next');

      // Trigger delay from now
      if (stopDelay) {
        stopTimeout = setTimeout(() => moveMasterSequence('delay', ids, 'stop'), stopDelay);
      }

      // Idle detection if channel !== 1
      if (stack.length === 0 && config.controller.channels > 1
        && moves.getChannel() && config.server.idle) {
        idleRemoteTimeout = setTimeout(() => {
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
 * Will resolve when the remote control is available
 * @param {number[]} move Move instructions
 * @return {bluebird} Resolve when all instructions are executed
 */
function waitSteadyRemote(move) {
  stack.push(move);

  // No concurrency
  if (stack.length === 1) {
    return Promise.resolve(move);
  }

  return new Promise(resolve => stackEmitter.on('next', () => {
    if (stack[0] === move) {
      return resolve(move);
    }

    return null;
  }));
}

module.exports = {
  moveMasterSequence,
  resetToFirstChannel
};
