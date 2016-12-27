<div align="center">
  <p>
    <img src="http://i.imgur.com/XSlu8in.png" width="546" alt="prism audio"/>
  </p>
</div>

Makes programmatically transcoding media easier

`npm install --save hydrabolt/prism-media`

```js
const Prism = require('prism-media');
const fs = require('fs');

const prism = new Prism();

const transcoder = prism.transcode({
  type: 'ffmpeg',
  media: './test/test.mp3',
  ffmpegArguments: [
    '-analyzeduration', '0',
    '-loglevel', '0',
    '-f', 's16le',
    '-ar', '48000',
    '-ac', '2',
  ],
});

transcoder.output.pipe(fs.createWriteStream('./test/test.pcm'));
```