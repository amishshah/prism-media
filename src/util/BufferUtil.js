function uintBytes(n) {
  return Math.ceil((Math.log2(n || 1) || 1) / 8) || 1;
}

function intBytes(n) {
  return Math.ceil(((Math.log2(n || 1) || 1) + 1) / 8) || 1;
}

const SINGLE_FLOAT_UPPER = (2 - Math.pow(2, -23)) * Math.pow(2, 127);
const SINGLE_FLOAT_LOWER = -SINGLE_FLOAT_UPPER;

function floatBytes(n) {
  return n >= SINGLE_FLOAT_LOWER && n <= SINGLE_FLOAT_UPPER ? 4 : 8;
}

module.exports = {
  ascii(str) { return Buffer.from(str, 'ascii'); },
  unicode(str) { return Buffer.from(str, 'utf8'); },
  uintBE(n) {
    if (typeof n !== 'number' || n < 0) throw new Error(`${n} is not an unsigned number!`);
    const buffer = Buffer.alloc(uintBytes(n));
    buffer.writeUIntBE(n, 0, buffer.length);
    return buffer;
  },
  uintLE(n) {
    if (typeof n !== 'number' || n < 0) throw new Error(`${n} is not an unsigned number!`);
    const buffer = Buffer.alloc(uintBytes(n));
    buffer.writeUIntLE(n, 0, buffer.length);
    return buffer;
  },
  intBE(n) {
    if (typeof n !== 'number') throw new Error(`${n} is not a number!`);
    const buffer = Buffer.alloc(intBytes(n));
    buffer.writeIntBE(n, 0, buffer.length);
    return buffer;
  },
  intLE(n) {
    if (typeof n !== 'number') throw new Error(`${n} is not a number!`);
    const buffer = Buffer.alloc(intBytes(n));
    buffer.writeIntLsE(n, 0, buffer.length);
    return buffer;
  },
  floatBE(n) {
    if (typeof n !== 'number') throw new Error(`${n} is not a float!`);
    const bytes = floatBytes(n);
    const buffer = Buffer.alloc(bytes);
    if (bytes === 4) buffer.writeFloatBE(n);
    else buffer.writeDoubleBE(n);
    return buffer;
  },
  floatLE(n) {
    if (typeof n !== 'number') throw new Error(`${n} is not a float!`);
    const bytes = floatBytes(n);
    const buffer = Buffer.alloc(bytes);
    if (bytes === 4) buffer.writeFloatLE(n);
    else buffer.writeDoubleLE(n);
    return buffer;
  },
  readFloatBE(b) {
    if (b.length === 4) return b.readFloatBE(0);
    else if (b.length === 8) return b.readDoubleBE(0);
    throw new Error(`Cannot determine whether buffer '${b}' is single or double precision`);
  },
  readFloatLE(b) {
    if (b.length === 4) return b.readFloatLE(0);
    else if (b.length === 8) return b.readDoubleLE(0);
    throw new Error(`Cannot determine whether buffer '${b}' is single or double precision`);
  },
};
