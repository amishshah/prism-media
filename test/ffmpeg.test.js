/* eslint-disable */

const fs = require('fs');
const prism = require('../');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);
const { roughlyEquals, streamToBuffer } = require('./util');

test('FFmpeg transcoder available', () => {
  expect(prism.FFmpeg).toBeTruthy();
  expect(prism.FFmpeg.getInfo().command).toBeTruthy();
  expect(prism.FFmpeg.getInfo().output).toBeTruthy();
  expect(prism.FFmpeg.getInfo().version).toBeTruthy();
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
