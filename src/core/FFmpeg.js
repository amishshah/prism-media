const ChildProcess = require('child_process');
const { Duplex } = require('stream');
let FFMPEG_COMMAND = null;

/**
 * An FFmpeg transform stream that provides an interface to FFmpeg.
 * @memberof core
 */
class FFmpeg extends Duplex {
  /**
   * Creates a new FFmpeg transform stream
   * @memberof core
   * @param {Object} options Options you would pass to a regular Transform stream, plus an `args` option
   * @param {Array<string>} options.args Arguments to pass to FFmpeg
   * @example
   * // By default, if you don't specify an input (`-i ...`) prism will assume you're piping a stream into it.
   * const transcoder = new prism.FFmpeg({
   *  args: [
   *    '-analyzeduration', '0',
   *    '-loglevel', '0',
   *    '-f', 's16le',
   *    '-ar', '48000',
   *    '-ac', '2',
   *  ]
   * });
   * const s16le = mp3File.pipe(transcoder);
   * const opus = s16le.pipe(new prism.opus.Encoder({ rate: 48000, channels: 2, frameSize: 960 }));
   */
  constructor(options = {}) {
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
    this.once('error', () => {});
    this.process.kill('SIGKILL');
  }
}

module.exports = FFmpeg;

function createFFmpeg({ args = [] } = {}) {
  if (!args.includes('-i')) args = ['-i', '-'].concat(args);
  return ChildProcess.spawn(selectFFmpegCommand(), args.concat(['pipe:1']));
}

function selectFFmpegCommand() {
  if (FFMPEG_COMMAND) return FFMPEG_COMMAND;
  try {
    FFMPEG_COMMAND = require('ffmpeg-static').path;
    return FFMPEG_COMMAND;
  } catch (e) {
    try {
      FFMPEG_COMMAND = require('ffmpeg-binaries');
      process.emitWarning('ffmpeg-binaries is not maintained, please install ffmpeg or ffmpeg-static via npm instead.');
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
}
