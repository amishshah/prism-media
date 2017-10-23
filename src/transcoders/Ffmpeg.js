const ChildProcess = require('child_process');
const { Duplex, Readable } = require('stream');
let FFMPEG_COMMAND = null;

// Need to improve using passthroughs

class FfmpegTransform extends Duplex {
  constructor(options) {
    super();
    this.process = createFfmpeg(options);
    this.process.stdout.on('data', this.push.bind(this));
    this.copy(['_write', 'end'], this.process.stdin);
    this.copy(['_read'], this.process.stdout);
    // Obviously this is bad, I'll change it later
    this.process.stdout.on('end', () => this.emit('end'));
  }

  copy(methods, target) {
    for (const method of methods) {
      this[method] = target[method].bind(target);
    }
  }
}

module.exports = FfmpegTransform;

function createFfmpeg(options) {
  let args = options.args || [];
  if (!options.input || options.input instanceof Readable) {
    args = ['-i', '-'].concat(args).concat(['pipe:1']);
  } else {
    args = ['-i', options.input].concat(args).concat(['pipe:1']);
  }
  return ChildProcess.spawn(selectFfmpegCommand(), args);
}

function selectFfmpegCommand() {
  if (FFMPEG_COMMAND) return FFMPEG_COMMAND;
  try {
    FFMPEG_COMMAND = require('ffmpeg-binaries').ffmpegPath();
    return FFMPEG_COMMAND;
  } catch (err) {
    for (const command of ['ffmpeg', 'avconv', './ffmpeg', './avconv']) {
      if (!ChildProcess.spawnSync(command, ['-h']).error) {
        FFMPEG_COMMAND = command;
        return FFMPEG_COMMAND;
      }
    }
    throw new Error('FFMPEG not found');
  }
}
