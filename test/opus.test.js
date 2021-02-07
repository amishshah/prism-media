/* eslint-disable */

const { createReadStream } = require('fs');
const { opus } = require('../');
const { streamToBuffer } = require('./util');

test('opus.OggDemuxer available', () => {
  expect(opus.OggDemuxer).toBeTruthy();
});

test('opus.WebmDemuxer available', () => {
  expect(opus.WebmDemuxer).toBeTruthy();
  expect(opus.WebmDemuxer.TOO_SHORT).toBeTruthy();
  expect(opus.WebmDemuxer.TAGS).toBeTruthy();
});

test('Opus encoders/decoders available', () => {
  expect(opus).toBeTruthy();
  expect(opus.Encoder).toBeTruthy();
  expect(opus.Decoder).toBeTruthy();
});

test('opus.OggDemuxer is sane', async done => {
  expect.assertions(1);
  const output = createReadStream('./test/audio/speech_orig.ogg')
    .pipe(new opus.OggDemuxer())
    .pipe(new opus.Decoder({ rate: 48000, channels: 1, frameSize: 960 }));
  const chunks = await streamToBuffer(output);
  expect(chunks.length).toBeGreaterThanOrEqual(103e3);
  done();
});

test('opus.WebmDemuxer is sane', async done => {
  expect.assertions(1);
  const output = createReadStream('./test/audio/speech_orig.webm')
    .pipe(new opus.WebmDemuxer())
    .pipe(new opus.Decoder({ rate: 48000, channels: 1, frameSize: 960 }));
  const chunks = await streamToBuffer(output);
  expect(chunks.length).toBeGreaterThanOrEqual(103e3);
  done();
});