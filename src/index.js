/**
 * @namespace prism
 */
module.exports = {
  opus: require('./transcoders/Opus.js'),
  FFmpeg: require('./transcoders/FFmpeg'),
  OggOpusDemuxer: require('./demuxers/OggOpus'),
  WebmOpusDemuxer: require('./demuxers/WebmOpus'),
  WebmVorbisDemuxer: require('./demuxers/WebmVorbis'),
  ...require('./core/'),
};
