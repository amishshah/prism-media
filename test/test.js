/* eslint-disable */

const fs = require('fs');
const prism = require('../');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);

test('FFmpeg transcoder available', () => {
  expect(prism.FFmpeg).toBeTruthy();
});

test('OggOpus Demuxer available', () => {
  expect(prism.OggOpusDemuxer).toBeTruthy();
});

test('Opus encoders/decoders available', () => {
  expect(prism.opus).toBeTruthy();
  expect(prism.opus.Encoder).toBeTruthy();
  expect(prism.opus.Decoder).toBeTruthy();
});

test('Volume Transformers available', () => {
  expect(prism.VolumeTransformer16LE).toBeTruthy();
  expect(prism.VolumeTransformer16BE).toBeTruthy();
  expect(prism.VolumeTransformer32LE).toBeTruthy();
  expect(prism.VolumeTransformer32BE).toBeTruthy();
});

test('FFmpeg transcoder to PCM is sane', async done => {

  expect.assertions(1);
  const output = fs.createReadStream('./test/audio/speech_orig.ogg')
    .pipe(new prism.FFmpeg({
      args: [
        '-analyzeduration', '0',
        '-loglevel', '0',
        '-f', 's16le',
        '-ar', '48000',
        '-ac', '2',
      ],
    }));
  const chunks = await streamToBuffer(output);
  const file = await readFile('./test/audio/speech_orig.pcm');
  expect(roughlyEquals(file, chunks)).toEqual(true);
  done();
});

test('OggOpus demuxer is sane', async done => {
  expect.assertions(1);
  const output = fs.createReadStream('./test/audio/speech_orig.ogg').pipe(new prism.OggOpusDemuxer());
  const chunks = await streamToBuffer(output);
  const file = await readFile('./test/audio/speech_orig.opusdump');
  expect(roughlyEquals(file, chunks)).toEqual(true);
  done();
});

// The output is slightly different on travis because of ffmpeg version, should account for it
function roughlyEquals(x, y) {
  if (x.length !== y.length) return false;
  for (i = 0; i < x.length; i++) {
    if (Math.abs(x[i] - y[i]) > 1) {
      return false;
    }
  }
  return true;
}

function streamToBuffer(stream) {
  return new Promise((resolve, reject) => {
    let chunks = [];
    stream.on('data', chunk => chunks.push(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });
}
