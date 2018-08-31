class VINT {
  static length(int) {
    let i = 0;
    for (; i < 8; i++) if (int & (1 << (7 - i))) break;
    return i + 1;
  }

  static decode(buffer) {
    const length = VINT.length(buffer[0]);
    if (length > buffer.length) return { length };
    let data = buffer.slice(0, length);
    if (data.equals(VINT.LIVE_STREAM)) return { length: Infinity, data, value: Infinity };
    data[0] &= 0xFF >> length;
    return { length, data, value: data.length <= 6 ? data.readUIntBE(0, data.length) : null };
  }

  static encode(n) {
    if (n === Infinity) return VINT.LIVE_STREAM;
    const nBits = Math.ceil(Math.log2(n || 1)) || 1;
    let nBytes = Math.ceil(nBits / 8);
    const nFreeBits = nBits % 8 ? 8 - (nBits % 8) : 0;
    if (nBytes > nFreeBits) nBytes++;
    n |= 1 << (7 * nBytes);
    const buffer = Buffer.alloc(nBytes);
    buffer.writeUIntBE(n, 0, buffer.length);
    return buffer;
  }
}

VINT.LIVE_STREAM = Buffer.from([0x01, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff]);

module.exports = VINT;

