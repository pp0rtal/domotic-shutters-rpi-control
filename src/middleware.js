const logger = require('log4js').getLogger();

const master = require('./master');

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
 * @param next
 * @return {*}
 */
module.exports = function(req, res, next) {
  const ids = getSelection(req.params.selection);
  const instruction = req.params.instruction;

  // Direct instruction
  if (['open', 'close', 'stop', 'select'].includes(instruction)) {
    return master.moveMasterSequence(req.originalUrl, ids, instruction)
      .then(() => res.end())
      .then(() => logger.log('', `${ids} ${ids.length > 1 ? "are" : 'is'} ${loggerLangHelper[instruction]}`))
      .catch((e) => {
        res.status = 500;
        res.end(e.toString());
        logger.error('', e.message);
      });
  }

  // Partial
  const partialMove = parsePartialMove(instruction);
  if (partialMove) {
    logger.warning(`TODO partial move ${partialMove}`);
  }

  return next();
};


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
  str = str.replace(/[^\d,]/g, '');

  return str.split(',').sort();
}
