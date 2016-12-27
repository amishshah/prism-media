const EventEmitter = require('events').EventEmitter;
const ChildProcess = require('child_process');

/**
 * A spawned FFMPEG process
 */
class FfmpegProcess extends EventEmitter {
  constructor(transcoder, args, inputStream) {
    super();
    /**
     * The ffmpeg process
     * @type {ChildProcess}
     */
    this.process = ChildProcess.spawn(transcoder.command, args);
    /**
     * The transcoder that created this process
     * @type {FfmpegTranscoder}
     */
    this.transcoder = transcoder;
    /**
     * The input stream
     * @type {?ReadableStream}
     */
    this.inputStream = null;
    try {
      this.connectStream(inputStream);
    } catch (e) {
      this.emit('error', e, 'instantiation');
    }

    this.once('error', this.kill.bind(this));
  }

  /**
   * The ffmpeg output stream
   * @type {?ReadableStream}
   */
  get stream() {
    return this.process ? this.process.stdout : null;
  }

  /**
   * Connects an input stream to the ffmpeg process
   * @param {ReadableStream} inputStream the stream to pass to ffmpeg
   * @returns {ReadableStream} the ffmpeg output stream
   */
  connectStream(inputStream) {
    if (this.inputStream) throw new Error('Input stream is already connected!');
    if (!this.process) throw new Error('No FFMPEG process available');
    this.inputStream = inputStream;
    this.inputStream.pipe(this.process.stdin);

    this.process.stdin.on('error', e => {
      this.emit('error', e, 'ffmpegProcess.stdin');
    });

    this.process.stdout.on('error', e => {
      this.emit('error', e, 'ffmpegProcess.stdout');
    });

    this.process.on('error', e => {
      this.emit('error', e, 'ffmpegProcess');
    });

    this.process.stdout.on('end', () => {
      return 'do something';
    });

    return this.process.stdout;
  }

  /**
   * Kills the ffmpeg process
   */
  kill() {
    if (!this.process) return;
    if (this.inputStream) {
      this.inputStream.unpipe(this.process.stdin);
    }
    this.process.kill('SIGKILL');
    this.process = null;
  }
}

module.exports = FfmpegProcess;
