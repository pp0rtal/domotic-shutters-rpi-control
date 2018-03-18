const Promise = require('bluebird');
const logger = require('log4js').getLogger();

const moves = require('./moves');
const executor = require('./executor');

const stack = [];

/**
 * @param req
 * @param {*} req.params
 * @param {String} req.params.selection selected channels ('1,2,3')
 * @param {String} req.params.instruction open / close / stop
 * @param res
 * @param next
 * @return {*}
 */
module.exports = function(req, res, next) {
  const ids = getSelection(req.params.selection);
  const instruction = req.params.instruction;

  // Direct instruction
  if (['open', 'close', 'stop'].includes(instruction)) {
    return Promise.try(() => {
      const move = moves.getMoveInstructions(ids, instruction);
      logger.log('', `${req.originalUrl} - ${instruction} on ${ids} (${move})`);

      return move;
    })
      .then(move => planifyInstructions(move))
      .then(() => res.end())
      .then(() => logger.log('', `${ids} is ${instruction}`))
      .catch((e) => {
        res.status = 500;
        res.end(e.toString());
        logger.error('', e.message);
        throw e;
      });
  }

  const partialMove = parsePartialMove(instruction);
  if (partialMove) {
    console.log(`TODO move ${partialMove}`);
  }

  return next();
};

/**
 *
 * @param move
 * @return {Promise<void>}
 */
function planifyInstructions(move) {
  const job = () => executor.executeInstructionsSequence(move);

  return job();
}

/**
 * @param str Valid integer between [-100;100]
 * @return {number|null}
 */
function parsePartialMove(str) {
  if (/^[-\+]+%?$/.test(str)) {
    return null;
  }

  return Math.min(100, Math.max(-100, parseInt(str)));
}

/**
 * Parse list of shutters in URL
 * @param str String like "1,2,3" or "1+2+3"
 * @return {string[]}
 */
function getSelection(str) {
  str = str.replace(/[,;\+]+/, ',');

  return str.split(',');
}
