# prism-media
[![Build Status](https://travis-ci.org/hydrabolt/prism-media.svg?branch=master)](https://travis-ci.org/hydrabolt/prism-media)
[![dependencies](https://david-dm.org/hydrabolt/prism-media/status.svg)](https://david-dm.org/hydrabolt/prism-media)
[![devDependencies](https://david-dm.org/hydrabolt/prism-media/dev-status.svg)](https://david-dm.org/hydrabolt/prism-media?type=dev)

Intuitive abstractions that make transcoding media easy. Provides behind-the-scenes voice support for [discord.js](https://discord.js.org/).

- Stream-based
- Fast and Lightweight

`npm i hydrabolt/prism-media`

## FFmpeg Transform
```js
const fs = require('fs');
const prism = require('prism-media');

const input = fs.createReadStream('./file.mp3');
const output = fs.createWriteStream('./output.pcm');
const transcoder = new prism.FFmpeg({
  args: [
    '-analyzeduration', '0',
    '-loglevel', '0',
    '-f', 's16le',
    '-ar', '48000',
    '-ac', '2',
  ],
});

input.pipe(transcoder).pipe(output);
```

## OggOpus Demuxer
```js
const prism = require('prism-media');
const fs = require('fs');
const opus = require('node-opus');

const decoder = new opus.Decoder(48000, 2, 1920);

fs.createReadStream('./audio.ogg')
  .pipe(new prism.OggOpusDemuxer())
  .pipe(decoder)
  .pipe(fs.createWriteStream('./audio.pcm'))
```

## Roadmap
- Volume transform stream
- Page support for OggOpus
- Tidy up FFmpeg transform
- More Opus demuxers