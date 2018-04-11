// Based on discord.js' old volume system

const { Transform } = require('stream');
const loader = require('../util/loader');

const krypton = loader.require([['krypton']]).fn;
class VolumeTransformer extends Transform {
  constructor(options = {}) {
    super(options);
    this._bits = options.bits;
    this._bytes = this._bits / 8;
    this._extremum = Math.pow(2, this._bits - 1) - 1;
    this.volume = options.volume || 1;
    this._chunk = Buffer.alloc(0);
  }

  _readInt(buffer, index) { return index; }
  _writeInt(buffer, int, index) { return index; }

  _transform(chunk, encoding, done) {
    // If the volume is 1, act like a passthrough stream
    if (this.volume === 1) {
      this.push(chunk);
      return done();
    }

    const { _bytes, _extremum } = this;

    chunk = this._chunk = Buffer.concat([this._chunk, chunk]);
    if (chunk.length < _bytes) return done();

    let transformed;
    let complete;

    if (krypton && krypton.pcm.simd && this._krypton) {
      if (chunk.length < 64) return done();
      transformed = this._krypton(chunk.slice(0, chunk.length - (chunk.length % 64)), this.volume);
      complete = transformed.length;
    } else {
      transformed = Buffer.alloc(chunk.length);
      complete = Math.floor(chunk.length / _bytes) * _bytes;

      for (let i = 0; i < complete; i += _bytes) {
        const int = Math.min(_extremum, Math.max(-_extremum, Math.floor(this.volume * this._readInt(chunk, i))));
        this._writeInt(transformed, int, i);
      }
    }

    this._chunk = chunk.slice(complete);
    this.push(transformed);
    return done();
  }

  _destroy(err, cb) {
    super._destroy(err, cb);
    this._chunk = null;
  }

  setVolume(volume) {
    this.volume = volume;
  }

  setVolumeDecibels(db) {
    this.setVolume(Math.pow(10, db / 20));
  }

  setVolumeLogarithmic(value) {
    this.setVolume(Math.pow(value, 1.660964));
  }

  get volumeDecibels() {
    return Math.log10(this._volume) * 20;
  }

  get volumeLogarithmic() {
    return Math.pow(this._volume, 1 / 1.660964);
  }
}

class VolumeTransformer16LE extends VolumeTransformer {
  constructor(options) { super({ ...options, bits: 16 }); }
  _readInt(buffer, index) { return buffer.readInt16LE(index); }
  _writeInt(buffer, int, index) { return buffer.writeInt16LE(int, index); }

  _krypton(buffer, volume) {
    return krypton.do(krypton.pcm.volume16(buffer, volume)).run(false);
  }
}

class VolumeTransformer16BE extends VolumeTransformer {
  constructor(options) { super({ ...options, bits: 16 }); }
  _readInt(buffer, index) { return buffer.readInt16BE(index); }
  _writeInt(buffer, int, index) { return buffer.writeInt16BE(int, index); }
}

class VolumeTransformer32LE extends VolumeTransformer {
  constructor(options) { super({ ...options, bits: 32 }); }
  _readInt(buffer, index) { return buffer.readInt32LE(index); }
  _writeInt(buffer, int, index) { return buffer.writeInt32LE(int, index); }
}

class VolumeTransformer32BE extends VolumeTransformer {
  constructor(options) { super({ ...options, bits: 32 }); }
  _readInt(buffer, index) { return buffer.readInt32BE(index); }
  _writeInt(buffer, int, index) { return buffer.writeInt32BE(int, index); }
}

module.exports = {
  VolumeTransformer16LE,
  VolumeTransformer16BE,
  VolumeTransformer32LE,
  VolumeTransformer32BE,
};
