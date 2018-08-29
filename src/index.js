/**
 * @namespace prism
 */
module.exports = {
  opus: require('./transcoders/Opus.js'),
  OggOpusDemuxer: require('./demuxers/OggOpus'),
  WebmOpusDemuxer: require('./demuxers/WebmOpus'),
  WebmVorbisDemuxer: require('./demuxers/WebmVorbis'),
  ffmpeg: require('./ffmpeg'),
  ...require('./core/'),
};
