[![Logo](https://hydrabolt.me/assets/prism-media-logo.svg)](https://hydrabolt.me/prism-media/)

<div align="center">

[![Build Status](https://github.com/typescord/prism-media/workflows/Tests/badge.svg)](https://github.com/typescord/opus/actions?query=workflow%3ATests)
[![Patreon discord.js](https://img.shields.io/badge/donate-patreon-F96854.svg)](https://www.patreon.com/discordjs)

</div>

## What is it?

An easy-to-use stream-based toolkit that you can use for media processing. All the features provided have predictable
abstractions and join together coherently.

```js
// This example will demux and decode an Opus-containing OGG file, and then write it to a file.
const prism = require('@typescord/prism-media');
const { createReadStream, createWriteStream } = require('fs');

createReadStream('./audio.ogg')
  .pipe(new prism.opus.OggDemuxer())
  .pipe(new prism.opus.Decoder({ rate: 48000, channels: 2, frameSize: 960 }))
  .pipe(createWriteStream('./audio.pcm'));
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
  - [`@typescord/opus`](https://github.com/typescord/opus)
  - [`@discordjs/opus`](https://github.com/discordjs/opus)
  - [`opusscript`](https://github.com/abalabahaha/opusscript)
- FFmpeg
  - [`ffmpeg-static`](http://npmjs.com/ffmpeg-static)
  - `ffmpeg` from a [normal installation](https://www.ffmpeg.org/download.html)

## Useful Links

- [Documentation](https://hydrabolt.me/prism-media)
- [Examples](https://github.com/amishshah/prism-media/tree/master/examples)
- [Patreon](https://www.patreon.com/discordjs)

## License

> Copyright 2019 - 2020 Amish Shah
> 
> Licensed under the Apache License, Version 2.0 (the "License");
> you may not use this file except in compliance with the License.
> You may obtain a copy of the License at
> 
>    http://www.apache.org/licenses/LICENSE-2.0
> 
> Unless required by applicable law or agreed to in writing, software
> distributed under the License is distributed on an "AS IS" BASIS,
> WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
> See the License for the specific language governing permissions and
> limitations under the License.
