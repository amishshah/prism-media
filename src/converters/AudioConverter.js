const Ffmpeg = require('./Ffmpeg');

const converters = [
  'ffmpeg',
];

class AudioConverter {
  constructor(prism) {
    this.prism = prism;
    this.ffmpeg = new Ffmpeg(this);
  }

  static verifyOptions(options) {
    if (!options) throw new Error('Options must be passed to AudioConverter.convert()');
    if (!options.type) throw new Error('Options.type must be passed to AudioConverter.convert()');
    if (!options.stream) throw new Error('Options.stream must be passed to AudioConverter.convert()');
    if (!converters.includes(options.type)) throw new Error(`Options.type must be: ${converters.join(' ')}`);
    return options;
  }

  /**
   * Converts an Audio Stream based on specified options
   * @param {Object} options the options for conversion
   * @returns {ReadableStream} the converted stream
   */
  convert(options) {
    options = AudioConverter.verifyOptions(options);
    return this[options.type].convert(options);
  }
}

module.exports = AudioConverter;
