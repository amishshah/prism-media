/* eslint no-console: 0 */
const Prism = require('../');
const fs = require('fs');

const prism = new Prism.Prism();

const transcoder = prism.transcode({
  type: 'ffmpeg',
  stream: fs.createReadStream('./test/test.mp3'),
});

transcoder.stream.pipe(fs.createWriteStream('./test/test.pcm'));
