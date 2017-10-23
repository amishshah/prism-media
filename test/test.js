/* eslint-disable */

const fs = require('fs');
const prism = require('../');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);

test('FFmpeg transcoder to PCM is sane', async done => {
  expect.assertions(1);
  const output = fs.createReadStream('./test/audio/speech_orig.ogg')
    .pipe(new prism.transcoders.Ffmpeg({
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
  expect(file == chunks).toEqual(true);

  done();
});

test('OggOpus demuxer is sane', async done => {
  expect.assertions(1);
  const output = fs.createReadStream('./test/audio/speech_orig.ogg').pipe(new prism.demuxers.OggOpus());
  const chunks = await streamToBuffer(output);
  const file = await readFile('./test/audio/speech_orig.opusdump');
  expect(file == chunks).toEqual(true);
  done();
});

function streamToBuffer(stream) {
  return new Promise((resolve, reject) => {
    let chunks = '';
    stream.on('data', chunk => chunks += chunk);
    stream.on('error', reject);
    stream.on('end', () => resolve(chunks));
  });
}
