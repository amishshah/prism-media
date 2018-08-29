const stringToBuffer = require('../util/stringToBuffer');

module.exports = {
  OPUS_HEAD: Buffer.from(stringToBuffer('OpusHead')),
  OPUS_TAGS: Buffer.from(stringToBuffer('OpusTags')),
};
