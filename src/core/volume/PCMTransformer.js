// Based on discord.js' old volume system

const { Transform } = require('stream');

// The valid types of volume transform you can have:
const TYPES = {
  's16le': {
    read: Buffer.prototype.readInt16LE,
    write: Buffer.prototype.writeInt16LE,
    bits: 16,
  },
  's16be': {
    read: Buffer.prototype.readInt16BE,
    write: Buffer.prototype.writeInt16BE,
    bits: 16,
  },
  's32le': {
    read: Buffer.prototype.readInt32LE,
    write: Buffer.prototype.writeInt32LE,
    bits: 32,
  },
  's32be': {
    read: Buffer.prototype.readInt32BE,
    write: Buffer.prototype.writeInt32BE,
    bits: 32,
  },
};

/**
 * A transform stream that changes the volume of an input stream of PCM audio
 * @memberof prism.volume
 */
class PCMTransformer extends Transform {
  /**
   * Creates a new PCMTransformer
   * @param {Object} options In addition to the regular options of a TransformStream, the following properties
   * are required:
   * @param {string} options.type The type of the transformer, one of `s16le`, `s32le`, `s16be`, `s32be`
   */
  constructor(options) {
    if (!TYPES[options.type]) throw new Error(`Volume Transformer type '${options.type}' is invalid!`);
    super(options);

    const type = TYPES[options.type];
    /**
     * The number of bits that each frame uses
     * @readonly
     * @type {number}
     */
    this.bits = type.bits;
    /**
     * The number of bytes that each frame uses
     * @readonly
     * @type {number}
     */
    this.bytes = this.bits / 8;
    /**
     * The magnitude of the maximum value that this transform stream can output
     * @readonly
     * @type {number}
     */
    this.extremum = Math.pow(2, this.bits - 1) - 1;
    /**
     * The volume relative to the input stream - i.e. 1 is same, 0.5 is half, 2 is double.
     * @readonly
     * @type {number}
     */
    this.volume = options.volume || 1;

    this._readInt = type.read.bind(this);
    this._writeInt = type.write.bind(this);

    this._chunk = Buffer.alloc(0);
  }

  // These are stub methods, will be replaced by the methods in TYPES above
  _readInt(buffer, index) { return index; }
  _writeInt(buffer, int, index) { return index; }

  _transform(chunk, encoding, done) {
    // If the volume is 1, act like a passthrough stream
    if (this.volume === 1) {
      this.push(chunk);
      return done();
    }

    const { bytes, extremum } = this;

    chunk = this._chunk = Buffer.concat([this._chunk, chunk]);
    if (chunk.length < bytes) return done();

    const transformed = Buffer.alloc(chunk.length);
    const complete = Math.floor(chunk.length / bytes) * bytes;

    for (let i = 0; i < complete; i += bytes) {
      this._writeInt(transformed,
        Math.min(extremum, Math.max(-extremum, Math.floor(this.volume * this._readInt(chunk, i)))),
        i);
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
   * Sets the volume relative to the input stream - i.e. 1 is normal, 0.5 is half, 2 is double
   * @param {number} volume The new volume
   */
  setVolume(volume) {
    this.volume = volume;
  }
  /**
   * Sets the volume in decibels
   * @param {number} db The decibels
   */
  setVolumeDecibels(db) {
    this.setVolume(Math.pow(10, db / 20));
  }

  /**
   * Set the volume so that a perceived value of 0.5 is half the perceived volume etc
   * @param {number} value The value for the volume
   */
  setVolumeLogarithmic(value) {
    this.setVolume(Math.pow(value, 1.660964));
  }

  /**
   * The volume in decibels
   * @type {number}
   */
  get volumeDecibels() {
    return Math.log10(this._volume) * 20;
  }

  /**
   * The perceived volume
   * @type {number}
   */
  get volumeLogarithmic() {
    return Math.pow(this._volume, 1 / 1.660964);
  }
}

module.exports = PCMTransformer;
