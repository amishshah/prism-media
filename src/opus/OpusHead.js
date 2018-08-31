const { OPUS_HEAD } = require('./Constants');

class OpusHead {
  constructor(options = {}) {
    options = {
      version: 1,
      outputChannelCount: 2,
      preSkip: 312,
      inputSampleRate: 48000,
      outputGain: 0,
      ...options,
    };
    this.version = options.version;
    this.outputChannelCount = options.outputChannelCount;
    this.preSkip = options.preSkip;
    this.inputSampleRate = options.inputSampleRate;
    this.outputGain = options.outputGain;
  }

  static verify(buffer) {
    return buffer.slice(0, 8).equals(OPUS_HEAD);
  }

  encode() {
    const buffer = Buffer.alloc(19);
    OPUS_HEAD.copy(buffer);
    buffer.writeUInt8(this.version, 8);
    buffer.writeUInt8(this.outputChannelCount, 9);
    buffer.writeUInt16LE(this.preSkip, 10);
    buffer.writeUInt32LE(this.inputSampleRate, 12);
    buffer.writeUInt16LE(this.outputGain, 16);
    return buffer;
  }

  static from(buffer) {
    if (!OpusHead.verify(buffer)) throw new Error(`'${buffer}' is not an Opus header!`);
    return new OpusHead({
      version: buffer.readUInt8(8),
      outputChannelCount: buffer.readUInt8(9),
      preSkip: buffer.readUInt16LE(10),
      inputSampleRate: buffer.readUInt32LE(12),
      outputGain: buffer.readUInt16LE(16),
    });
  }
}

module.exports = OpusHead;
