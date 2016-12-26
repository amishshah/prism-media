exports.Converters = {
  Ffmpeg: {
    defaultArguments: [
      '-analyzeduration', '0',
      '-loglevel', '0',
      '-i', '-',
      '-f', 's16le',
      '-ar', '48000',
      '-ac', '2',
      'pipe:1',
    ],
  },
};
