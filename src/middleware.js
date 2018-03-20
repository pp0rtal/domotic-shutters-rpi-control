const logger = require('log4js').getLogger();

const master = require('./master');
const config = require('../config');

// For logs
const loggerLangHelper = {
  open: 'opening',
  close: 'closing',
  stop: 'stopped',
  select: 'selected',
};

/**
 * @param req
 * @param {*} req.params
 * @param {String} req.originalUrl Raw URL
 * @param {String} req.params.selection selected channels ('1,2,3')
 * @param {String} req.params.instruction open / close / stop
 * @param res
 * @return {*}
 */
module.exports = function(req, res) {
  const ids = getSelection(req.params.selection);
  let instruction = req.params.instruction;
  let stopDelay = 0;

  // Partial instruction
  if (!['open', 'close', 'stop', 'select'].includes(instruction)) {
    const partialMove = parsePartialMove(instruction);
    if (partialMove === null) {
      res.status = 400;
      return res.end(`invalid action ${instruction}`);
    }

    instruction = (partialMove < 0) ? 'close' : 'open';
    instruction = (partialMove === 0) ? 'stop' : instruction;
    stopDelay = config.timing.realtime[instruction] * Math.abs(partialMove);
  }

  return master.moveMasterSequence(req.originalUrl, ids, instruction, stopDelay)
    .then(() => res.end())
    .then(() => logger.log('', `${ids} ${ids.length > 1 ? "are" : 'is'} ${loggerLangHelper[instruction]}`))
    .catch((e) => {
      res.status = 500;
      res.end(e.toString());
      logger.error('', e.message);
      throw e;
    });
};

/**
 * @param str Valid integer between [-100;100]
 * @return {number|null}
 */
function parsePartialMove(str) {
  const value = Math.min(100, Math.max(-100, parseFloat(str)));
  return (value > 1 || value < -1) ? value / 100 : value;
}

/**
 * Parse list of shutters in URL
 * @param str String like "1,2,3" or "1+2+3"
 * @return {string[]}
 */
function getSelection(str) {
  str = str.replace(/[,;\+]+/, ',');
  str = str.replace(/[^\d,]/g, '');

  return str.split(',').sort();
}
