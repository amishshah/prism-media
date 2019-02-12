const WebmBaseDemuxer = require('../core/WebmBase');

const OPUS_HEAD = Buffer.from([...'OpusHead'].map(x => x.charCodeAt(0)));

/**
 * Demuxes a Webm stream (containing Opus audio) to output an Opus stream.
 * @extends {WebmBaseDemuxer}
 * @memberof opus
 */
class WebmDemuxer extends WebmBaseDemuxer {
  _checkHead(data) {
    if (!data.slice(0, 8).equals(OPUS_HEAD)) {
      throw Error('Audio codec is not Opus!');
    }
  }
}

module.exports = WebmDemuxer;
