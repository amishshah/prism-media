const ChildProcess = require('child_process');
const { Duplex, Readable } = require('stream');
let FFMPEG_COMMAND = null;

class FfmpegTransform extends Duplex {
  constructor(options) {
    super();
    this.process = createFfmpeg(options);
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

    this.copy(['write', 'end'], this._writer);
    this.copy(['read', 'setEncoding', 'pipe', 'unpipe'], this._reader);

    for (const method of ['on', 'once', 'removeListener', 'removeListeners', 'listeners']) {
      this[method] = (ev, fn) => EVENTS[ev] ? EVENTS[ev][method](ev, fn) : Duplex.prototype[method].call(this, ev, fn);
    }

    const processError = error => this.emit('error', error);
    this._reader.on('error', processError);
    this._writer.on('error', processError);
  }

  get _reader() { return this.process.stdout; }
  get _writer() { return this.process.stdin; }

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
