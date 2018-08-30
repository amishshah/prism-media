const stringToBuffer = require('../util/stringToBuffer');

module.exports = {
  OPUS_HEAD: stringToBuffer('OpusHead'),
  OPUS_TAGS: stringToBuffer('OpusTags'),
};
