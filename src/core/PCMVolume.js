// Based on discord.js' old volume system

const { Transform } = require('stream');

/**
 * Transforms a stream of PCM volume.
 * **You can't directly instantiate this class, see the 16LE/16BE/32LE/32BE implementations!**
 * @protected
 * @class
 * @memberof core
 * @extends TransformStream
 */
class VolumeTransformer extends Transform {
  /**
   * @memberof core
   * @param {Object} [options={}] Options that you would pass to a regular Transform stream
   */
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

    transformed = Buffer.alloc(chunk.length);
    complete = Math.floor(chunk.length / _bytes) * _bytes;

    for (let i = 0; i < complete; i += _bytes) {
      const int = Math.min(_extremum, Math.max(-_extremum, Math.floor(this.volume * this._readInt(chunk, i))));
      this._writeInt(transformed, int, i);
    }

    this._chunk = chunk.slice(complete);
    this.push(transformed);
    return done();
  }

  _destroy(err, cb) {
    super._destroy(err, cb);
    this._chunk = null;
  }

  /**
   * Sets the volume relative to the input stream - i.e. 1 is normal, 0.5 is half, 2 is double.
   * @param {number} volume The volume that you want to set
   */
  setVolume(volume) {
    this.volume = volume;
  }

  /**
   * Sets the volume in decibels.
   * @param {number} db The decibels
   */
  setVolumeDecibels(db) {
    this.setVolume(Math.pow(10, db / 20));
  }

  /**
   * Sets the volume so that a perceived value of 0.5 is half the perceived volume etc.
   * @param {number} value The value for the volume
   */
  setVolumeLogarithmic(value) {
    this.setVolume(Math.pow(value, 1.660964));
  }

  /**
   * The current volume of the stream in decibels
   * @readonly
   * @type {number}
   */
  get volumeDecibels() {
    return Math.log10(this._volume) * 20;
  }
  /**
   * The current volume of the stream from a logarithmic scale
   * @readonly
   * @type {number}
   */
  get volumeLogarithmic() {
    return Math.pow(this._volume, 1 / 1.660964);
  }
}

/**
 * A 16-bit little-endian PCM volume transformer
 * @extends core.VolumeTransformer
 * @memberof core
 * @example
 * const transformer = new prism.VolumeTransformer16LE();
 */
class VolumeTransformer16LE extends VolumeTransformer {
  /**
   * Creates a new volume transformer
   * @constructs
   * @param {Object} [options={}] The options you would pass to a regular Transform stream
   */
  constructor(options) { super({ ...options, bits: 16 }); }
  _readInt(buffer, index) { return buffer.readInt16LE(index); }
  _writeInt(buffer, int, index) { return buffer.writeInt16LE(int, index); }
}

/**
 * A 16-bit big-endian PCM volume transformer
 * @extends core.VolumeTransformer
 * @memberof core
 * @example
 * const transformer = new prism.VolumeTransformer16BE();
 */
class VolumeTransformer16BE extends VolumeTransformer {
  /**
   * Creates a new volume transformer
   * @constructs
   * @param {Object} [options={}] The options you would pass to a regular Transform stream
   */
  constructor(options) { super({ ...options, bits: 16 }); }
  _readInt(buffer, index) { return buffer.readInt16BE(index); }
  _writeInt(buffer, int, index) { return buffer.writeInt16BE(int, index); }
}

/**
 * A 32-bit little-endian PCM volume transformer
 * @extends core.VolumeTransformer
 * @memberof core
 * @example
 * const transformer = new prism.VolumeTransformer32LE();
 */
class VolumeTransformer32LE extends VolumeTransformer {
  /**
   * Creates a new volume transformer
   * @constructs
   * @param {Object} [options={}] The options you would pass to a regular Transform stream
   */
  constructor(options) { super({ ...options, bits: 32 }); }
  _readInt(buffer, index) { return buffer.readInt32LE(index); }
  _writeInt(buffer, int, index) { return buffer.writeInt32LE(int, index); }
}

/**
 * A 32-bit big-endian PCM volume transformer
 * @extends core.VolumeTransformer
 * @memberof core
 * @example
 * const transformer = new prism.VolumeTransformer32BE();
 */
class VolumeTransformer32BE extends VolumeTransformer {
  /**
   * Creates a new volume transformer
   * @constructs
   * @param {Object} [options={}] The options you would pass to a regular Transform stream
   */
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
