# prism-media
[![Build Status](https://travis-ci.org/hydrabolt/prism-media.svg?branch=master)](https://travis-ci.org/hydrabolt/prism-media)
[![dependencies](https://david-dm.org/hydrabolt/prism-media/status.svg)](https://david-dm.org/hydrabolt/prism-media)
[![devDependencies](https://david-dm.org/hydrabolt/prism-media/dev-status.svg)](https://david-dm.org/hydrabolt/prism-media?type=dev)

Pleasant abstractions that make transcoding media easy. Provides behind-the-scenes voice support for [discord.js](https://discord.js.org/).

- Stream-based
- Intuitive
- Fast and Lightweight

`npm install --save hydrabolt/prism-media`

## FFmpeg Transform
```js
const prism = require('prism-media');
const fs = require('fs');

fs.createReadStream('./audio.ogg')
  .pipe(new prism.transcoders.FFmpeg({
      args: [
        '-analyzeduration', '0',
        '-loglevel', '0',
        '-f', 's16le',
        '-ar', '48000',
        '-ac', '2',
      ],
    }))
  .pipe(fs.createWriteStream('./audio.pcm'))
```

## OggOpus Demuxer
```js
const prism = require('prism-media');
const fs = require('fs');
const opus = require('node-opus');

const decoder = new opus.Decoder(48000, 2, 1920);

fs.createReadStream('./audio.ogg')
  .pipe(new prism.demuxers.OggOpus())
  .pipe(decoder)
  .pipe(fs.createWriteStream('./audio.pcm'))
```

## Roadmap
- Volume transform stream
- Page support for OggOpus
- Tidy up FFmpeg transform
- More Opus demuxers