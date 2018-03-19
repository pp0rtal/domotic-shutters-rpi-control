const Promise = require('bluebird');
const logger = require('log4js').getLogger();
const GPIO = Promise.promisifyAll(require('rpi-gpio'));

const config = require('../config');
const Moves = require('./moves');

/**
 * Call all buttons in the defined array, sleep between each button call.
 * @param {number[]} instructions Array of moves to do (Move constants)
 * @return {Promise<void>}
 */
function executeInstructionsSequence(instructions) {
  return Promise.each(instructions, (instruction) => {
    const isRadioButton = instruction !== Moves.NEXT && instruction !== Moves.PREV;
    const pressDuration = isRadioButton ? config.timing.durationRadioButton : config.timing.durationSelectButton;

    return triggerGPIO(instruction, pressDuration)
      .then(() => Promise.delay(pressDuration));
  });
}

/**
 * @param {number} mode constant order from Move package
 * @param {number} delay Milliseconds to trigger this pin
 * @return {PromiseLike<void>}
 */
function triggerGPIO(mode, delay) {
  const pin = retrievePin(mode);

  if (config.server.simulate) {
    const instruction = retrieveInstruction(mode);

    return Promise.try(() => logger.debug('', `pin ${pin} (${instruction}) up (${delay}ms)`))
      .then(() => Promise.delay(delay))
      .then(() => Promise.delay(config.timing.sleepDuration));
  }

  return GPIO.writeAsync(pin, true)
    .then(() => Promise.delay(delay))
    .then(() => GPIO.writeAsync(pin, false))
    .then(() => Promise.delay(config.timing.sleepDuration))
    .catch(e => {
      throw new Error(`GPIO error: ${e.message}`)
    });
}

/**
 * @param move Constant from move module
 * @return {number} Pin
 */
function retrievePin(move) {
  const key = Object.keys(Moves).reduce((res, key) =>
    res || (move === Moves[key] && key), false);

  if (key && config.gpio[key.toLowerCase()]) {
    return config.gpio[key.toLowerCase()]
  }
  throw new Error(`Can not find pin for move=${move}`);
}

/** @return {Promise<void>} setup required pins */
function initGPIO() {
  if (config.server.simulate) {
    return Promise.resolve();
  }

  return Promise.all(Object.keys(config.gpio).map(gpioName =>
    GPIO.setupAsync(config.gpio[gpioName], GPIO.DIR_OUT)));
}

/** @return {Promise<void>} clear all pins */
function closeGPIO() {
  if (config.server.simulate) {
    return Promise.delay();
  }

  return GPIO.destroyAsync();
}

/**
 * For dev purpose, print the constant name
 * @param {number} move Constant value
 * @return {*}
 */
function retrieveInstruction(move) {
  return Object.keys(Moves).reduce((res, key) =>
    res || (move === Moves[key] && key), false);
}

module.exports = {
  executeInstructionsSequence,
  initGPIO,
  closeGPIO
};
