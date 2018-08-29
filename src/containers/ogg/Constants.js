const stringToBuffer = require('../../util/stringToBuffer');

module.exports = {
  OGGS_HEADER: stringToBuffer('OggS'),
  OGG_PAGE_HEADER_SIZE: 26,
  STREAM_STRUCTURE_VERSION: 0,
};
