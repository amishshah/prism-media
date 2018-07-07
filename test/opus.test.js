/* eslint-disable */

const fs = require('fs');
const prism = require('../');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);
const { roughlyEquals, streamToBuffer } = require('./util');

test('OggOpus Demuxer available', () => {
  expect(prism.OggOpusDemuxer).toBeTruthy();
});

test('WebmOpus Demuxer available', () => {
  expect(prism.WebmOpusDemuxer).toBeTruthy();
  expect(prism.WebmOpusDemuxer.TOO_SHORT).toBeTruthy();
  expect(prism.WebmOpusDemuxer.TAGS).toBeTruthy();
});

test('WebmVorbis Demuxer available', () => {
  expect(prism.WebmVorbisDemuxer).toBeTruthy();
  expect(prism.WebmVorbisDemuxer.TOO_SHORT).toBeTruthy();
  expect(prism.WebmVorbisDemuxer.TAGS).toBeTruthy();
});

test('Opus encoders/decoders available', () => {
  expect(prism.opus).toBeTruthy();
  expect(prism.opus.Encoder).toBeTruthy();
  expect(prism.opus.Decoder).toBeTruthy();
});

test('OggOpus demuxer is sane', async done => {
  expect.assertions(1);
  const output = fs.createReadStream('./test/audio/speech_orig.ogg').pipe(new prism.OggOpusDemuxer());
  const chunks = await streamToBuffer(output);
  const file = await readFile('./test/audio/speech_orig.opusdump');
  expect(roughlyEquals(file, chunks)).toEqual(true);
  done();
});
