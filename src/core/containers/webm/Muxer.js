const { Transform } = require('stream');
const { Tag } = require('../../ebml');

class Muxer extends Transform {
  constructor(options) {
    super({ ...options, writableObjectMode: true, highWaterMark: 2 });
    this.document = new Tag('EBML', [
      new Tag('EBMLVersion', 1),
      new Tag('EBMLReadVersion', 1),
      new Tag('EBMLMaxIDLength', 4),
      new Tag('EBMLMaxSizeLength', 8),
      new Tag('DocType', 'webm'),
      new Tag('DocTypeVersion', 4),
      new Tag('DocTypeReadVersion', 2),
    ]);
    this.segment = new Tag('Segment', [
      new Tag('Info', [
        new Tag('TimecodeScale', 1000000),
        new Tag('MuxingApp', 'amishshah/prism-media'),
        new Tag('WritingApp', 'amishshah/prism-media'),
      ]),
      new Tag('Tracks', [
        new Tag('TrackEntry', [
          new Tag('TrackNumber', 1),
          new Tag('TrackUID', 1),
          new Tag('FlagLacing', 0),
          new Tag('CodecDelay', 6500000),
          new Tag('SeekPreRoll', 80000000),
          new Tag('CodecID', 'A_OPUS'),
          new Tag('TrackType', 2),
          new Tag('Audio', [
            new Tag('Channels', 2),
            new Tag('SamplingFrequency', 48000),
            new Tag('BitDepth', 16000),
          ]),
          new Tag('CodecPrivate', Buffer.from([
            0x4F, 0x70, 0x75, 0x73, 0x48, 0x65, 0x61, 0x64, 0x01, 0x02, 0x38, 0x01, 0x80, 0xBB, 0, 0, 0, 0, 0,
          ])),
        ]),
      ]),
    ], { liveStream: true });
    this.push(Buffer.concat([this.document.encode(), this.segment.encode()]));
    this.frameCount = 0;
    this.frameDuration = 20;
    this.cluster = null;
    this._makeCluster();
  }

  _makeCluster() {
    if (this.cluster) {
      this.push(this.cluster.encode());
    }
    this.cluster = new Tag('Cluster', [
      new Tag('Timecode', this.frameCount * this.frameDuration),
    ]);
  }

  _flush(done) {
    this.push(this.cluster.encode());
    done();
  }

  _transform(chunk, encoding, done) {
    const buffer = Buffer.alloc(chunk.length + 4);
    buffer[0] = 0x81;
    buffer.writeUInt16BE((this.frameCount % 100) * this.frameDuration, 1);
    buffer[3] = 1 << 7;
    chunk.copy(buffer, 4);
    const tag = new Tag('SimpleBlock', buffer);
    this.cluster.add(tag);
    if (this.frameCount % 100 === 0) {
      this._makeCluster();
    }
    this.frameCount++;
    done();
  }
}

module.exports = Muxer;
