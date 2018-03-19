const config = require('../config');

let currentChannel = 0;
const controller = {
  getMovesInstructions,
  SELECT: [],
  NEXT: 1,
  PREV: -1,
  OPEN: 2,
  CLOSE: -2,
  STOP: 0
};

module.exports = controller;
module.exports.getChannel = getChannel;

/**
 * @param {int[]} channels An array of all channel to open / close / stop
 * @param {String} move 'open' / 'close' / 'stop'
 * @return {int[]} An array of all instructions to execute
 */
function getMovesInstructions(channels, move = 'select') {
  const channel = currentChannel;
  try {
    return channels.reduce((result, chan) => result.concat(
      getPointerMovesToChannel(chan - 1),
      controller[move.toUpperCase()]
    ), []);
  } catch (e) {
    currentChannel = channel;
    throw e;
  }
}

/**
 * Returns the list of insructions to select the channel
 * @param toChan Channel to select, must start from 0
 * @return {number[]} Array of PREV / NEXT instructions
 */
function getPointerMovesToChannel(toChan) {
  const maxChannels = config.controller.channels;
  if (toChan < 0 || toChan >= maxChannels) {
    throw new Error(`channel ${toChan + 1} out of limits [1;${maxChannels}]`);
  }

  // Count how much instructions are required
  const countInc = (currentChannel <= toChan)
    ? (toChan - currentChannel)
    : (maxChannels - currentChannel + toChan);
  const countDec = (toChan <= currentChannel)
    ? (currentChannel - toChan)
    : (currentChannel + maxChannels - toChan);

  // Set current channel
  currentChannel = toChan;

  // Fill instructions with shortest move
  return (config.controller.allowDec && countDec < countInc)
    ? Array(countDec).fill(controller.PREV)
    : Array(countInc).fill(controller.NEXT);
}

/**
 * @return {number} Calculated channel after all actions
 */
function getChannel() {
  return currentChannel;
}
