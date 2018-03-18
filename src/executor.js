const Promise = require('bluebird');
const logger = require('log4js').getLogger();
const gpio = Promise.promisifyAll(require('rpi-gpio'));

const config = require('../config');
const Moves = require('./moves');

/**
 * Call all buttons in the defined array, sleep between each button call.
 * @param {number[]} instructions Array of moves to do (Move constants)
 * @return {Promise<void>}
 */
function executeInstructionsSequence(instructions) {
  return Promise.each(instructions, (instruction) => {
    const isRadioButton = instruction !== Moves.DEC && instruction !== Moves.DEC;
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

  if (config.gpio.simulate) {
    const instruction = retrieveInstruction(mode);

    return Promise.try(() => logger.debug('', `pin ${pin} (${instruction}) up`))
      .then(() => Promise.delay(delay))
      .then(() => logger.debug('', `pin ${pin} (${instruction}) down`))
      .then(() => Promise.delay(config.timing.sleepDuration));
  }

  return gpio.writeAsync(pin, true)
    .then(() => Promise.delay(delay))
    .then(() => gpio.writeAsync(pin, false))
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
  switch (move) {
    case Moves.PREV:
      return config.gpio.prev;
    case Moves.NEXT:
      return config.gpio.next;
    case Moves.OPEN:
      return config.gpio.open;
    case Moves.STOP:
      return config.gpio.stop;
    case Moves.CLOSE:
      return config.gpio.close;
  }
  throw new Error(`Can not find pin for move=${move}`);
}

/** @return {Promise<void>} setup required pins */
function initGPIO() {
  return Promise.all(Object.keys(config.gpio).forEach(gpioName =>
    gpio.setupAsync(config.gpio[gpioName], gpio.DIR_OUT)));
}

/** @return {Promise<void>} clear all pins */
function closeGPIO() {
  return gpio.destroyAsync();
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
