const prism = require('../');
const fs = require('fs');

console.time('remux');
const input = fs.createReadStream('/home/hydrabolt/Downloads/song.ogg');
const ogg = new prism.ogg.Demuxer();
const webm = new prism.webm.Muxer();
const out = fs.createWriteStream('./out.webm');

webm.on('end', () => console.timeEnd('remux'));

input.pipe(ogg).pipe(webm).pipe(out);

