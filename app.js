const opt = {
  channel: 0,
  max: 7,
  allowDec: true  // Allow research of channel to the "left", to the "right"
};
let options;

const INSTRUCTIONS = { INC: -1, DEC: 1, OPEN: 2, CLOSE: -2, STOP: 0 };

/**
 *
 * @param toChan Channel to select
 * @return {Array}
 */
function œ(toChan) {
  if (toChan < 0 || toChan > opt.max) {
    throw new Error(`channel ${toChan} out of limits [0;${opt.max}]`);
  }

  // Count how much instructions are required
  const countInc = (opt.channel <= toChan)
    ? (toChan - opt.channel)
    : (opt.max - opt.channel + toChan);
  const countDec = (toChan <= opt.channel)
    ? (opt.channel - toChan)
    : (opt.channel + opt.max - toChan);

  // Fill instructions with shortest move
  return (opt.allowDec && countDec < countInc)
    ? Array(countDec).fill(INSTRUCTIONS.DEC)
    : Array(countInc).fill(INSTRUCTIONS.INC);
}

module.exports = function(_options) {
  options = Object.assign(opt, _options);

};
module.exports.selectChannel = selectChannel;
