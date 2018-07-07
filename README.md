
<div align="center">
  <br />
  <p>
    <img src="https://i.imgur.com/ubpDp4r.png" width="546" />
  </p>

[![Build Status](https://travis-ci.org/hydrabolt/prism-media.svg?branch=master)](https://travis-ci.org/hydrabolt/prism-media)
[![dependencies](https://david-dm.org/hydrabolt/prism-media/status.svg)](https://david-dm.org/hydrabolt/prism-media)
[![devDependencies](https://david-dm.org/hydrabolt/prism-media/dev-status.svg)](https://david-dm.org/hydrabolt/prism-media?type=dev)
[![npm](https://img.shields.io/npm/dt/prism-media.svg)](https://www.npmjs.com/package/prism-media)

<p><b>Intuitive abstractions that make transcoding media easy. Provides behind-the-scenes audio support for <a href="https://discord.js.org">discord.js</a></b></p>

`npm install prism-media`

</div>

------
## Dependencies
- Opus
  - [`krypton`](https://hackzzila.com/krypton/) (development)
  - [`node-opus`](https://github.com/Rantanen/node-opus) (^0.2.7)
  - [`opusscript`](https://github.com/abalabahaha/opusscript) (^0.0.4)
- Other
  - [`ffmpeg-binaries`](http://npmjs.com/ffmpeg-binaries) (^3.2.2-3)

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
  .pipe(new prism.OggOpusDemuxer())
  .pipe(decoder)
  .pipe(fs.createWriteStream('./audio.pcm'))
```
