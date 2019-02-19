[![Build Status](https://travis-ci.org/amishshah/prism-media.svg?branch=master)](https://travis-ci.org/hydrabolt/prism-media)
[![dependencies](https://david-dm.org/amishshah/prism-media/status.svg)](https://david-dm.org/hydrabolt/prism-media)
[![npm](https://img.shields.io/npm/dt/prism-media.svg)](https://www.npmjs.com/package/prism-media)
[![Patreon](https://img.shields.io/badge/donate-patreon-F96854.svg)](https://www.patreon.com/discordjs)

**Intuitive abstractions that make transcoding media easy. Provides behind-the-scenes audio support for
[discord.js](https://discord.js.org)**

`npm install prism-media`

------
## Dependencies
- Opus
  - [`node-opus`](https://github.com/Rantanen/node-opus) (^0.3.1)
  - [`opusscript`](https://github.com/abalabahaha/opusscript) (^0.0.6)
- FFmpeg
  - [`ffmpeg-static`](http://npmjs.com/ffmpeg-binaries) (^2.4.0)
  - [`ffmpeg-binaries`](http://npmjs.com/ffmpeg-binaries) (^4.0.0)

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

const decoder = new opus.Decoder({ rate: 48000, channels: 2, frameSize: 960 });

fs.createReadStream('./audio.ogg')
  .pipe(new prism.opus.OggDemuxer())
  .pipe(decoder)
  .pipe(fs.createWriteStream('./audio.pcm'))
```
