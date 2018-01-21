# `prism.FFmpeg`

The FFmpeg transcoder is designed to take any media stream and pipe it into a spawned ffmpeg process.

Make sure you have ffmpeg available on your system if you want to use it. Try installing [ffmpeg-binaries](https://www.npmjs.com/package/ffmpeg-binaries) if ffmpeg isn't already available in your path.

## Usage
```js
new prism.FFmpeg(options);
```

Where options is an object containing the `args` property, an array of arguments to pass through to ffmpeg when spawning the process.

## Example
This stream is used heavily in [discord.js](https://discord.js.org/) to transcode media files to raw audio ready to be assembled into Opus packets to then send over voice connections, as such here is a relevant example:

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

By default, if your arguments are missing the `-i` flag, we will assume that you're going to pipe a stream into the ffmpeg process, so we'll prepend `['-i', '-']` for you.

However, ffmpeg supports a [lot of protocols](https://ffmpeg.org/ffmpeg-protocols.html) so we can simplify the above example and probably reduce some overhead by telling ffmpeg where our file is rather than piping it in ourselves:

```js
const fs = require('fs');
const prism = require('prism-media');

const output = fs.createWriteStream('./output.pcm');
const transcoder = new prism.FFmpeg({
  args: [
    '-i', 'file.mp3',
    '-analyzeduration', '0',
    '-loglevel', '0',
    '-f', 's16le',
    '-ar', '48000',
    '-ac', '2',
  ],
});

transcoder.pipe(output);
```