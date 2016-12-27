/* eslint no-console: 0 */
const Prism = require('../');
const fs = require('fs');

const prism = new Prism.Prism();

const converter = prism.convert({
  type: 'ffmpeg',
  stream: fs.createReadStream('./test/test.mp3'),
});

converter.stream.pipe(fs.createWriteStream('./test/test.pcm'));
