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
  expect(chunks.equals(file)).toEqual(true);

  for (let i = 0; i < file.length; i++) {
    if (chunks.readUInt8(i) !== file.readUInt8(i)) {
      console.log(i, chunks.readUint8(i), file.readUInt8(i))
    }
  }

  done();
});

test('OggOpus demuxer is sane', async done => {
  expect.assertions(1);
  const output = fs.createReadStream('./test/audio/speech_orig.ogg').pipe(new prism.demuxers.OggOpus());
  const chunks = await streamToBuffer(output);
  const file = await readFile('./test/audio/speech_orig.opusdump');
  expect(chunks.equals(file)).toEqual(true);
  done();
});

function streamToBuffer(stream) {
  return new Promise((resolve, reject) => {
    let chunks = [];
    stream.on('data', chunk => chunks.push(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });
}
