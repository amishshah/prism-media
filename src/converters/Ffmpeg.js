const ChildProcess = require('child_process');
const Constants = require('../util/Constants');
const FfmpegProcess = require('./FfmpegProcess');

const ffmpegSources = [
  'ffmpeg',
  'avconv',
  './ffmpeg',
  './avconv',
  'node_modules/ffmpeg-binaries/bin/ffmpeg',
  'node_modules\\ffmpeg-binaries\\bin\\ffmpeg',
];

class FfmpegConverter {
  constructor(audioConverter) {
    this.audioConverter = audioConverter;
    this.command = FfmpegConverter.selectFfmpegCommand();
    this.processes = [];
  }

  convert(options) {
    const inputStream = options.stream;
    return this.spawnProcess(options.arguments, inputStream).process.stdout;
  }

  spawnProcess(args = [], stream) {
    if (!this.command) this.command = FfmpegConverter.selectFfmpegCommand();
    return new FfmpegProcess(this, Constants.Converters.Ffmpeg.defaultArguments.concat(args), stream);
  }

  static selectFfmpegCommand() {
    for (const command of ffmpegSources) {
      if (!ChildProcess.spawnSync(command, ['-h']).error) return command;
    }
    throw new Error('FFMPEG not found');
  }
}

module.exports = FfmpegConverter;
