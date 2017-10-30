const { Transform } = require('stream');

/**
 * Demuxes a Webm stream to output an Opus stream.
 * @extends {TransformStream}
 */
class WebmOpusTransform extends Transform {
  /**
   * Creates a new WebmOpus demuxer.
   * @param {Object} [options] options that you would pass to a regular Transform stream.
   */
  constructor(options = {}) {
    super(Object.assign({ readableObjectMode: true }, options));
    this._remainder = null;
    this.offset = 0;
    this.length = 0;
    this.count = 0;
    this.skipUntil = null;
    this.track = null;
    this._incompleteTrack = {};
  }

  _transform(chunk, encoding, done) {
    this.length += chunk.length;
    if (this._remainder) {
      chunk = Buffer.concat([this._remainder, chunk]);
      this._remainder = null;
    }
    this.offset = 0;
    if (this.skipUntil && this.length > this.skipUntil) {
      this.offset = this.skipUntil - this.count;
      this.skipUntil = null;
    } else if (this.skipUntil) {
      this.count += chunk.length;
      return done();
    }
    let result;
    while (result !== TOO_SHORT) {
      result = this.readTag(chunk, this.offset);
      if (result === TOO_SHORT) break;
      if (result.skipUntil) {
        this.skipUntil = result.skipUntil;
        break;
      }
      if (result.offset) this.offset = result.offset;
      else break;
    }
    this.count += this.offset;
    this._remainder = chunk.slice(this.offset);
    return done();
  }

  /**
   * Reads an EBML ID from a buffer.
   * @private
   * @param {Buffer} chunk the buffer to read from.
   * @param {number} offset the offset in the buffer.
   * @returns {Object|Symbol} contains an `id` property (buffer) and the new `offset` (number).
   * Returns the TOO_SHORT symbol if the data wasn't big enough to facilitate the request.
   */
  readEBMLID(chunk, offset = this.offset) {
    const idLength = vintLength(chunk, offset);
    if (idLength === TOO_SHORT) return TOO_SHORT;
    return {
      id: chunk.slice(offset, offset + idLength),
      offset: offset + idLength,
    };
  }

  /**
   * Reads a size variable-integer to calculate the length of the data of a tag.
   * @private
   * @param {Buffer} chunk the buffer to read from. 
   * @param {number} offset the offset in the buffer.
   * @returns {Object|Symbol} contains property `offset` (number), `dataLength` (number) and `sizeLength` (number).
   * Returns the TOO_SHORT symbol if the data wasn't big enough to facilitate the request.
   */
  readTagDataSize(chunk, offset = this.offset) {
    const sizeLength = vintLength(chunk, offset);
    if (sizeLength === TOO_SHORT) return TOO_SHORT;
    const dataLength = expandVint(chunk, offset, offset + sizeLength);
    return { offset: offset + sizeLength, dataLength, sizeLength };
  }

  /**
   * Takes a buffer and attempts to read and process a tag.
   * @private
   * @param {Buffer} chunk the buffer to read from. 
   * @param {number} offset the offset in the buffer.
   * @returns {Object|Symbol} contains the new `offset` (number) and optionally the `skipUntil` property,
   * indicating that the stream should ignore any data until a certain length is reached.
   * Returns the TOO_SHORT symbol if the data wasn't big enough to facilitate the request.
   */
  readTag(chunk, offset = this.offset) {
    const idData = this.readEBMLID(chunk, offset);
    if (idData === TOO_SHORT) return TOO_SHORT;
    const ebmlID = idData.id.toString('hex');
    offset = idData.offset;
    const sizeData = this.readTagDataSize(chunk, offset);
    if (sizeData === TOO_SHORT) return TOO_SHORT;
    const { dataLength } = sizeData;
    offset = sizeData.offset;
    // If this tag isn't useful, tell the stream to stop processing data until the tag ends
    if (typeof TAGS[ebmlID] === 'undefined') {
      if (chunk.length > offset + dataLength) {
        return { offset: offset + dataLength };
      }
      return { offset, skipUntil: this.count + offset + dataLength };
    }

    const tagHasChildren = TAGS[ebmlID];
    if (tagHasChildren) {
      return { offset };
    }

    if (offset + dataLength > chunk.length) return TOO_SHORT;
    const data = chunk.slice(offset, offset + dataLength);
    if (!this.track) {
      if (ebmlID === 'ae') this._incompleteTrack = {};
      if (ebmlID === 'd7') this._incompleteTrack.number = data[0];
      if (ebmlID === '83') this._incompleteTrack.type = data[0];
      if (this._incompleteTrack.type === 2 && typeof this._incompleteTrack.number !== 'undefined') {
        this.track = this._incompleteTrack;
      }
    }
    if (ebmlID === 'a3') {
      if (!this.track) throw Error('No audio track in this webm!');
      if ((data[0] & 0xF) === this.track.number) {
        this.push(data.slice(4));
      }
    }
    return { offset: offset + dataLength };
  }
}

/**
 * A symbol that is returned by some functions that indicates the buffer it has been provided is not large enough
 * to facilitate a request.
 * @name WebmOpusTransform#TOO_SHORT
 * @type {Symbol} 
 */
const TOO_SHORT = WebmOpusTransform.TOO_SHORT = Symbol('TOO_SHORT');

/**
 * A map that takes a value of an EBML ID in hex string form, with the value being a boolean that indicates whether
 * this tag has children.
 * @name WebmOpusTransform#TAGS
 * @type {Object}
 */
const TAGS = WebmOpusTransform.TAGS = { // value is true if the element has children
  '1a45dfa3': true, // EBML
  '18538067': true, // Segment
  '1f43b675': true, // Cluster
  '1654ae6b': true, // Tracks
  'ae': true, // TrackEntry
  'd7': false, // TrackNumber
  '83': false, // TrackType
  'a3': false, // Simple Block
};

module.exports = WebmOpusTransform;

function vintLength(buffer, index) {
  let i = 0;
  for (; i < 8; i++) if ((1 << (7 - i)) & buffer[index]) break;
  i++;
  if (index + i > buffer.length) {
    return TOO_SHORT;
  }
  return i;
}

function expandVint(buffer, start, end) {
  const length = vintLength(buffer, start);
  if (end > buffer.length || length === TOO_SHORT) return TOO_SHORT;
  let mask = (1 << (8 - length)) - 1;
  let value = buffer[start] & mask;
  for (let i = start + 1; i < end; i++) {
    value = (value << 8) + buffer[i];
  }
  return value;
}
