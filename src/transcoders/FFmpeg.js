const ChildProcess = require('child_process');
const { Duplex } = require('stream');
let FFMPEG_COMMAND = null;

class FFmpegTransform extends Duplex {
  constructor(options) {
    super();
    this.process = createFFmpeg(options);
    const EVENTS = {
      readable: this._reader,
      data: this._reader,
      end: this._reader,
      unpipe: this._reader,
      finish: this._writer,
      drain: this._writer,
    };

    this._readableState = this._reader._readableState;
    this._writableState = this._writer._writableState;

    this._copy(['write', 'end'], this._writer);
    this._copy(['read', 'setEncoding', 'pipe', 'unpipe'], this._reader);

    for (const method of ['on', 'once', 'removeListener', 'removeListeners', 'listeners']) {
      this[method] = (ev, fn) => EVENTS[ev] ? EVENTS[ev][method](ev, fn) : Duplex.prototype[method].call(this, ev, fn);
    }

    const processError = error => this.emit('error', error);
    this._reader.on('error', processError);
    this._writer.on('error', processError);
  }

  get _reader() { return this.process.stdout; }
  get _writer() { return this.process.stdin; }

  _copy(methods, target) {
    for (const method of methods) {
      this[method] = target[method].bind(target);
    }
  }

  _destroy(err, cb) {
    super._destroy(err, cb);
    this.process.kill('SIGKILL');
  }
}

module.exports = FFmpegTransform;

function createFFmpeg(options) {
  let args = options.args || [];
  if (!options.args.includes('-i')) args = ['-i', '-'].concat(args);
  return ChildProcess.spawn(selectFFmpegCommand(), args.concat(['pipe:1']));
}

function selectFFmpegCommand() {
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
