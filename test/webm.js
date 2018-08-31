const prism = require('../');
const fs = require('fs');

fs.createReadStream('/home/hydrabolt/Downloads/song.ogg')
  .pipe(new prism.ogg.Demuxer())
  .pipe(new prism.webm.Muxer())
  .pipe(fs.createWriteStream('./out.webm'));
