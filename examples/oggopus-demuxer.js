// This example will demux an Opus-containing OGG file, decode the Opus packets to PCM and then write it to a file.
const prism = require('prism-media');
const fs = require('fs');

fs.createReadStream('./audio.ogg')
  .pipe(new prism.opus.OggDemuxer())
  .pipe(new prism.opus.Decoder({ rate: 48000, channels: 2, frameSize: 960 }))
  .pipe(fs.createWriteStream('./audio.pcm'));
