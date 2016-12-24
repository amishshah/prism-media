const AudioConverter = require('./AudioConverter');

class Prism {
  constructor() {
    this.audioConverter = new AudioConverter(this);
  }
}

module.exports = Prism;
