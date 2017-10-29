function exp(mod) {
  for (const key in mod) {
    module.exports[key] = mod[key];
  }
}

module.exports = {
  opus: require('./transcoders/Opus.js'),
  FFmpeg: require('./transcoders/FFmpeg'),
  OggOpusDemuxer: require('./demuxers/OggOpus'),
  WebmOpusDemuxer: require('./demuxers/WebmOpus'),
};

exp(require('./transformers/PCMVolume'));
