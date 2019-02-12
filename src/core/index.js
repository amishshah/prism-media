/**
 * Core features
 * @namespace core
 */
module.exports = {
  FFmpeg: require('./FFmpeg'),
  ...require('./PCMVolume'),
};
