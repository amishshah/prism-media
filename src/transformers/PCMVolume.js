// Based on discord.js' old volume system

const { Transform } = require('stream');

class VolumeTransformer extends Transform {
  constructor(options, { bits = 16, volume = 1 } = {}) {
    super(options);
    this.bits = bits;
    this.bytes = this.bits / 8;
    this.extremum = Math.pow(2, this.bits - 1) - 1;
    this.volume = volume;
    this._chunk = Buffer.alloc(0);
  }

  readInt(buffer, index) { return index; }
  writeInt(buffer, int, index) { return index; }

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
    let i = 0;
    for (; i < complete; i += bytes) {
      const int = Math.min(extremum, Math.max(-extremum, Math.floor(this.volume * this.readInt(chunk, i))));
      this.writeInt(transformed, int, i);
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
  constructor(options, { volume = 1 } = {}) { super(options, { volume, bits: 16 }); }
  readInt(buffer, index) { return buffer.readInt16LE(index); }
  writeInt(buffer, int, index) { return buffer.writeInt16LE(int, index); }
}

class VolumeTransformer16BE extends VolumeTransformer {
  constructor(options, { volume = 1 } = {}) { super(options, { volume, bits: 16 }); }
  readInt(buffer, index) { return buffer.readInt16BE(index); }
  writeInt(buffer, int, index) { return buffer.writeInt16BE(int, index); }
}

class VolumeTransformer32LE extends VolumeTransformer {
  constructor(options, { volume = 1 } = {}) { super(options, { volume, bits: 32 }); }
  readInt(buffer, index) { return buffer.readInt32LE(index); }
  writeInt(buffer, int, index) { return buffer.writeInt32LE(int, index); }
}

class VolumeTransformer32BE extends VolumeTransformer {
  constructor(options, { volume = 1 } = {}) { super(options, { volume, bits: 32 }); }
  readInt(buffer, index) { return buffer.readInt32BE(index); }
  writeInt(buffer, int, index) { return buffer.writeInt32BE(int, index); }
}

module.exports = {
  VolumeTransformer16LE,
  VolumeTransformer16BE,
  VolumeTransformer32LE,
  VolumeTransformer32BE,
};
