const { Transform } = require('stream');
const { Matroska, VINT } = require('../../ebml');
const OpusHead = require('../../../opus/OpusHead');
const VORBIS_HEAD = Buffer.from('vorbis');

const TYPES = {
  opus(data) {
    if (!OpusHead.verify(data)) throw Error('Audio codec is not Opus!');
    this.emit('head', OpusHead.from(data));
  },
  vorbis(data) {
    if (data.readUInt8(0) !== 2 || !data.slice(4, 10).equals(VORBIS_HEAD)) {
      throw Error('Audio codec is not Vorbis!');
    }
    this.push(data.slice(3, 3 + data.readUInt8(1)));
    this.push(data.slice(3 + data.readUInt8(1), 3 + data.readUInt8(1) + data.readUInt8(2)));
    this.push(data.slice(3 + data.readUInt8(1) + data.readUInt8(2)));
  },
};

/**
 * Demuxes WebM streams
 * @extends {TransformStream}
 */
class WebmDemuxer extends Transform {
  /**
   * Creates a new Webm demuxer.
   * @param {string} type The type of the Demuxer, `opus` or `vorbis`.
   * @param {Object} [options] options that you would pass to a regular Transform stream.
   */
  constructor(type, options = {}) {
    super(Object.assign({ readableObjectMode: true }, options));
    if (!TYPES[type]) throw new Error('You need to provide a type to a Webm Demuxer (i.e. opus or vorbis)');
    this._checkHead = TYPES[type].bind(this);
    this._remainder = null;
    this._length = 0;
    this._count = 0;
    this._skipUntil = null;
    this._track = null;
    this._incompleteTrack = {};
    this._ebmlFound = false;
  }

  _transform(chunk, encoding, done) {
    this._length += chunk.length;
    if (this._remainder) {
      chunk = Buffer.concat([this._remainder, chunk]);
      this._remainder = null;
    }
    let offset = 0;
    if (this._skipUntil && this._length > this._skipUntil) {
      offset = this._skipUntil - this._count;
      this._skipUntil = null;
    } else if (this._skipUntil) {
      this._count += chunk.length;
      return done();
    }
    let result;
    while (result !== TOO_SHORT) {
      result = this._readTag(chunk, offset);
      if (result === TOO_SHORT) break;
      if (result._skipUntil) {
        this._skipUntil = result._skipUntil;
        break;
      }
      if (result.offset) offset = result.offset;
      else break;
    }
    this._count += offset;
    this._remainder = chunk.slice(offset);
    return done();
  }

  /**
   * Takes a buffer and attempts to read and process a tag.
   * @private
   * @param {Buffer} chunk the buffer to read from.
   * @param {number} offset the offset in the buffer.
   * @returns {Object|Symbol} contains the new `offset` (number) and optionally the `_skipUntil` property,
   * indicating that the stream should ignore any data until a certain length is reached.
   * Returns the TOO_SHORT symbol if the data wasn't big enough to facilitate the request.
   */
  _readTag(chunk, offset) {
    const idLength = VINT.length(chunk[offset]);
    if (idLength > chunk.length - offset) return TOO_SHORT;
    const ebmlID = chunk.slice(offset, offset + idLength);
    if (!this._ebmlFound) {
      if (ebmlID.equals(Matroska.EBML.id)) this._ebmlFound = true;
      else throw Error('Did not find the EBML tag at the start of the stream');
    }

    offset += idLength;
    const sizeData = VINT.decode(chunk.slice(offset));
    if (!sizeData.data) return TOO_SHORT;
    const dataLength = sizeData.value;
    offset += sizeData.length;
    // If this tag isn't useful, tell the stream to stop processing data until the tag ends
    const ebmlIDHex = ebmlID.toString('hex');
    if (typeof TAGS[ebmlIDHex] === 'undefined') {
      if (chunk.length > offset + dataLength) {
        return { offset: offset + dataLength };
      }
      return { offset, _skipUntil: this._count + offset + dataLength };
    }

    const tagHasChildren = TAGS[ebmlIDHex];
    if (tagHasChildren) {
      return { offset };
    }

    if (offset + dataLength > chunk.length) return TOO_SHORT;
    const data = chunk.slice(offset, offset + dataLength);
    if (!this._track) {
      if (ebmlID.equals(Matroska.TrackEntry.id)) this._incompleteTrack = {};
      if (ebmlID.equals(Matroska.TrackNumber.id)) this._incompleteTrack.number = data[0];
      if (ebmlID.equals(Matroska.TrackType.id)) this._incompleteTrack.type = data[0];
      if (this._incompleteTrack.type === 2 && typeof this._incompleteTrack.number !== 'undefined') {
        this._track = this._incompleteTrack;
      }
    }
    if (ebmlID.equals(Matroska.CodecPrivate.id)) {
      this._checkHead(data);
    } else if (ebmlID.equals(Matroska.SimpleBlock.id)) {
      if (!this._track) throw Error('No audio track in this webm!');
      if ((data[0] & 0xF) === this._track.number) {
        this.push(data.slice(4));
      }
    }
    return { offset: offset + dataLength };
  }
}

/**
 * A symbol that is returned by some functions that indicates the buffer it has been provided is not large enough
 * to facilitate a request.
 * @name WebmBaseDemuxer#TOO_SHORT
 * @type {Symbol}
 */
const TOO_SHORT = WebmDemuxer.TOO_SHORT = Symbol('TOO_SHORT');

/**
 * A map that takes a value of an EBML ID in hex string form, with the value being a boolean that indicates whether
 * this tag has children.
 * @name WebmBaseDemuxer#TAGS
 * @type {Object}
 */
const TAGS = WebmDemuxer.TAGS = { // value is true if the element has children
  [Matroska.EBML.idHex]: true,
  [Matroska.Segment.idHex]: true,
  [Matroska.Cluster.idHex]: true,
  [Matroska.Tracks.idHex]: true,
  [Matroska.TrackEntry.idHex]: true,
  [Matroska.TrackNumber.idHex]: false,
  [Matroska.TrackType.idHex]: false,
  [Matroska.SimpleBlock.idHex]: false,
  [Matroska.CodecPrivate.idHex]: false,
};

module.exports = WebmDemuxer;
