const MediaTranscoder = require('./transcoders/MediaTranscoder');

class Prism {
  constructor() {
    this.transcoder = new MediaTranscoder(this);
  }

  transcode(...args) {
    return this.transcoder.transcode(...args);
  }
}

module.exports = Prism;
