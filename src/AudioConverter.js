const ChildProcess = require('child_process');

const ffmpegSources = [
  'ffmpeg',
  'avconv',
  './ffmpeg',
  './avconv',
  'node_modules/ffmpeg-binaries/bin/ffmpeg',
  'node_modules\\ffmpeg-binaries\\bin\\ffmpeg',
];

class AudioConverter {
  constructor(prism) {
    this.prism = prism;
    this.command = AudioConverter.selectFfmpegCommand();
  }

  static selectFfmpegCommand() {
    for (const command of ffmpegSources) {
      if (!ChildProcess.spawnSync(command, ['-h']).error) return command;
    }
    throw new Error('Could not find FFMPEG');
  }
}

module.exports = AudioConverter;
