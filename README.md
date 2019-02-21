[![Logo](https://hydrabolt.me/assets/prism-media-logo.svg)](https://hydrabolt.me/prism-media/)

<div align="center">

[![Build Status](https://travis-ci.org/amishshah/prism-media.svg?branch=master)](https://travis-ci.org/hydrabolt/prism-media)
[![dependencies](https://david-dm.org/amishshah/prism-media/status.svg)](https://david-dm.org/hydrabolt/prism-media)
[![npm](https://img.shields.io/npm/dt/prism-media.svg)](https://www.npmjs.com/package/prism-media)
[![Patreon](https://img.shields.io/badge/donate-patreon-F96854.svg)](https://www.patreon.com/discordjs)

</div>

## What is it?

An easy-to-use stream-based toolkit that you can use for media processing. All the features provided have predictable
abstractions and join together coherently.

```js
// This example will demux an Opus-containing OGG file, decode the Opus packets to PCM and then write it to a file.
const prism = require('prism-media');
const fs = require('fs');

fs.createReadStream('./audio.ogg')
  .pipe(new prism.opus.OggDemuxer())
  .pipe(new prism.opus.Decoder({ rate: 48000, channels: 2, frameSize: 960 }))
  .pipe(fs.createWriteStream('./audio.pcm'));
```

The example above can work with either a native or pure JavaScript Opus decoder - you don't need to worry about changing
your code for whichever you install.

- FFmpeg support (either through npm modules or a normal installation) 
- Opus support (native or pure JavaScript)
- Demuxing for WebM/OGG files (no modules required!)
- Volume Altering (no modules required!)

## Dependencies

The following dependencies are all optional, and you should only install one from each category (the first listed in
each category is preferred)

- Opus
  - [`node-opus`](https://github.com/Rantanen/node-opus) (native, ^0.3.1)
  - [`opusscript`](https://github.com/abalabahaha/opusscript) (^0.0.6)
- FFmpeg
  - [`ffmpeg-static`](http://npmjs.com/ffmpeg-binaries) (^2.4.0)
  - [`ffmpeg-binaries`](http://npmjs.com/ffmpeg-binaries) (^4.0.0)
  - `ffmpeg` from a [normal installation](https://www.ffmpeg.org/download.html)

## Useful Links

- [Documentation](https://hydrabolt.me/prism-media)
- [Examples](https://github.com/amishshah/prism-media/tree/master/examples)
