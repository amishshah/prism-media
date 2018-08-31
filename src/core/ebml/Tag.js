const Matroska = require('./Matroska');
const VINT = require('./VINT');
const BufferUtil = require('../../util/BufferUtil');

class Tag {
  constructor(id, value = [], options = {}) {
    if (typeof id === 'string') {
      if (!Matroska[id]) throw new Error(`'${id}' is not a valid Matroska Element`);
      this._matroska = { id, ...Matroska[id] };
      this.id = this._matroska.id;
    } else if (Buffer.isBuffer(id)) {
      this.id = id;
    } else {
      throw new Error(`EBML ID '${id}' is not a Buffer!`);
    }
    this.options = options;
    this.value = value;
  }

  add(tag) {
    if (!Array.isArray(this.value)) this.value = [this.value];
    this.value.push(tag);
  }

  encode() {
    const values = Array.isArray(this.value) ? this.value : [this.value];
    const encodedValues = values.map(data => {
      if (data instanceof Tag) {
        return data.encode();
      } else if (Buffer.isBuffer(data)) {
        return data;
      } else if (this._matroska) {
        if (this._matroska.type === 'uinteger') {
          return BufferUtil.uintBE(data);
        } else if (this._matroska.type === 'string') {
          return BufferUtil.ascii(data);
        } else if (this._matroska.type === 'utf-8') {
          return BufferUtil.unicode(data);
        } else if (this._matroska.type === 'float') {
          return BufferUtil.floatBE(data);
        } else if (this._matroska.type === 'integer') {
          return BufferUtil.intBE(data);
        }
      }
      throw new Error(`Data '${data}' cannot be encoded into a Buffer!`);
    });
    const size = VINT.encode(this.options.liveStream ? Infinity : encodedValues.reduce((acc, x) => acc + x.length, 0));
    return Buffer.concat([this.id, size, ...encodedValues]);
  }
}

module.exports = Tag;
