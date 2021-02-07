// This example will demux an Opus-containing OGG file, decode the Opus packets to PCM and then write it to a file.
const { opus } = require('@typescord/prism-media');
const { createReadStream, createWriteStream } = require('fs');

createReadStream('./audio.ogg')
  .pipe(new opus.OggDemuxer())
  .pipe(new opus.Decoder({ rate: 48000, channels: 2, frameSize: 960 }))
  .pipe(createWriteStream('./audio.pcm'));
