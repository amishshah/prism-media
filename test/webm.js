const prism = require('../');
const fs = require('fs');

console.time('remux');
const input = fs.createReadStream('/home/hydrabolt/Downloads/song.ogg');
const ogg = new prism.ogg.Demuxer();

input.pipe(ogg);

ogg.on('head', opusHead => {
  const webm = new prism.webm.Muxer({ opusHead });
  const out = fs.createWriteStream('./out.webm');
  webm.on('end', () => console.timeEnd('remux'));
  ogg.pipe(webm).pipe(out);
});
