const EventEmitter = require('events').EventEmitter;
const ChildProcess = require('child_process');

/**
 * A spawned FFMPEG process
 */
class FfmpegProcess extends EventEmitter {
  constructor(converter, args, inputStream) {
    super();
    /**
     * The ffmpeg process
     * @type {ChildProcess}
     */
    this.process = ChildProcess.spawn(converter.command, args);
    /**
     * The converter that created this process
     * @type {FfmpegConverter}
     */
    this.converter = converter;
    /**
     * The input stream
     * @type {?ReadableStream}
     */
    this.inputStream = null;
    this.connectStream(inputStream).catch(e => this.emit('error', e));
  }

  connectStream(inputStream) {
    return new Promise(resolve => {
      if (this.inputStream) throw new Error('Input stream is already connected!');
      if (!this.process) throw new Error('No FFMPEG process available');
      this.inputStream = inputStream;
      this.inputStream.pipe(this.process.stdin);
      resolve(this.process.stdout);
    });
  }
}

module.exports = FfmpegProcess;
