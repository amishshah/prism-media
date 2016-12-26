const AudioConverter = require('./converters/AudioConverter');

class Prism {
  constructor() {
    this.audioConverter = new AudioConverter(this);
  }

  convert(options) {
    return this.audioConverter.convert(options);
  }
}

module.exports = Prism;
