const { Transform } = require('stream');

var OpusEncoder;

const CTL = {
  BITRATE: 4002,
  FEC: 4012,
  PLP: 4014,
};

try {
  OpusEncoder = require('node-opus').OpusEncoder;
} catch (e) {
  try {
    OpusEncoder = require('opusscript');
  } catch (x) {}
}

const charCode = x => x.charCodeAt(0);
const OPUS_HEAD = Buffer.from([...'OpusHead'].map(charCode));
const OPUS_TAGS = Buffer.from([...'OpusTags'].map(charCode));

class OpusStream extends Transform {
  constructor(options) {
    if (!OpusEncoder) {
      throw Error('Could not find an Opus module! Please install node-opus or opusscript.');
    }
    super({ readableObjectMode: true });
    if (OpusEncoder.Application) {
      options.application = OpusEncoder.Application[options.application];
    }
    this.encoder = new OpusEncoder(options.rate, options.channels, options.application);
    this.options = options;
  }

  static get type() {
    return OpusEncoder.Application ? 'opusscript' : 'node-opus';
  }

  setBitrate(bitrate) {
    (this.encoder.applyEncoderCTL || this.encoder.encoderCTL)
      .apply(this.encoder, [CTL.BITRATE, Math.min(128e3, Math.max(16e3, bitrate))]);
  }

  setFEC(enabled) {
    (this.encoder.applyEncoderCTL || this.encoder.encoderCTL)
      .apply(this.encoder, [CTL.FEC, enabled ? 1 : 0]);
  }

  setPLP(percentage) {
    (this.encoder.applyEncoderCTL || this.encoder.encoderCTL)
      .apply(this.encoder, [CTL.FEC, Math.min(100, Math.max(0, percentage * 100))]);
  }
}

class Encoder extends OpusStream {
  constructor(options) {
    super(options);
    this._buffer = Buffer.alloc(0);
  }

  _transform(chunk, encoding, done) {
    this._buffer = Buffer.concat([this._buffer, chunk]);
    const required = this.options.frameSize * this.options.channels * 2;
    let n = 0;
    while (this._buffer.length >= required * (n + 1)) {
      this.push(this.encoder.encode(this._buffer.slice(n * required, (n + 1) * required), this.options.frameSize));
      n++;
    }
    if (n > 0) this._buffer = this._buffer.slice(n * required);
    return done();
  }

  _destroy(err, cb) {
    super._destroy(err, cb);
    this._buffer = null;
  }
}

class Decoder extends OpusStream {
  _transform(chunk, encoding, done) {
    const signature = chunk.slice(0, 8);
    if (signature.equals(OPUS_HEAD)) {
      this.emit('format', {
        channels: this.options.channels,
        sampleRate: this.options.rate,
        bitDepth: 16,
        float: false,
        signed: true,
        version: chunk.readUInt8(8),
        preSkip: chunk.readUInt16LE(10),
        gain: chunk.readUInt16LE(16),
      });
      return done();
    }
    if (signature.equals(OPUS_TAGS)) {
      this.emit('tags', chunk);
      return done();
    }
    this.push(this.encoder.decode(chunk, this.options.frameSize));
    return done();
  }
}

module.exports = { Decoder, Encoder };
