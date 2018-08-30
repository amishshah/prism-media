/**
 * @namespace prism
 */
module.exports = {
  opus: require('./opus'),
  ffmpeg: require('./ffmpeg'),
  ...require('./core'),
};
