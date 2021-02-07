/* eslint-disable */

const { createReadStream, promises: { readFile } } = require('fs');
const { FFmpeg } = require('../');
const { roughlyEquals, streamToBuffer } = require('./util');

test('FFmpeg transcoder available', () => {
  expect(FFmpeg).toBeTruthy();
  expect(FFmpeg.getInfo().command).toBeTruthy();
  expect(FFmpeg.getInfo().output).toBeTruthy();
  expect(FFmpeg.getInfo().version).toBeTruthy();
});

test('FFmpeg transcoder to PCM is sane', async done => {
  expect.assertions(1);
  const output = createReadStream('./test/audio/speech_orig.ogg')
    .pipe(new FFmpeg({
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
