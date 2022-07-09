/* eslint-disable */

const fs = require('node:fs');
const prism = require('../');
const { streamToBuffer } = require('./util');

test('opus.OggDemuxer available', () => {
  expect(prism.opus.OggDemuxer).toBeTruthy();
});

test('opus.WebmDemuxer available', () => {
  expect(prism.opus.WebmDemuxer).toBeTruthy();
  expect(prism.opus.WebmDemuxer.TOO_SHORT).toBeTruthy();
  expect(prism.opus.WebmDemuxer.TAGS).toBeTruthy();
});

test('Opus encoders/decoders available', () => {
  expect(prism.opus).toBeTruthy();
  expect(prism.opus.Encoder).toBeTruthy();
  expect(prism.opus.Decoder).toBeTruthy();
});

test('opus.OggDemuxer is sane', async () => {
  const output = fs.createReadStream('./test/audio/speech_orig.ogg')
    .pipe(new prism.opus.OggDemuxer())
    .pipe(new prism.opus.Decoder({ rate: 48000, channels: 1, frameSize: 960 }));
  const chunks = await streamToBuffer(output);
  expect(chunks.length).toBeGreaterThanOrEqual(103e3);
});

test('opus.WebmDemuxer is sane', async () => {
  const output = fs.createReadStream('./test/audio/speech_orig.webm')
    .pipe(new prism.opus.WebmDemuxer())
    .pipe(new prism.opus.Decoder({ rate: 48000, channels: 1, frameSize: 960 }));
  const chunks = await streamToBuffer(output);
  expect(chunks.length).toBeGreaterThanOrEqual(103e3);
});