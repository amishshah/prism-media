# prism-media

Helps to make transcoding media easier

`npm install --save hydrabolt/prism-media`

```js
const Prism = require('prism-media').Prism;
const fs = require('fs');

const prism = new Prism();

prism.convert({
  type: 'ffmpeg',
  stream: fs.createReadStream('input.mp3'),
}).stream.pipe(fs.createWriteStream('pcm output'));
```