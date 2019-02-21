// This example converts an MP3 file stream to an Opus packet stream

const fs = require('fs');
const prism = require('prism-media');

// Any input that FFmpeg accepts can be used here -- you could use mp4 or wav for example.
const input = fs.createReadStream('./file.mp3');
const transcoder = new prism.FFmpeg({
  args: [
    '-analyzeduration', '0',
    '-loglevel', '0',
    '-f', 's16le',
    '-ar', '48000',
    '-ac', '2',
  ],
});

const opus = new prism.opus.Encoder({ rate: 48000, channels: 2, frameSize: 960 });

input
  .pipe(transcoder)
  .pipe(opus);

/* The output could for example be played in Discord.js as an Opus stream if you would like to manually control
   how the opus stream is generated */
