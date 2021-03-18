import type { TransformCallback } from 'stream';
import { OpusStream, OpusStreamConfig } from './OpusStream';

const OPUS_HEAD = Buffer.from('OpusHead');
const OPUS_TAGS = Buffer.from('OpusTags');

export class OpusDecoderStream extends OpusStream {
	public opusHead?: Buffer;
	public opusTags?: Buffer;

	public constructor(options: OpusStreamConfig) {
		super({
			...options,
			streamOptions: {
				...options.streamOptions,
				writableObjectMode: true,
				readableObjectMode: true,
			},
		});
	}

	public _transform(chunk: Buffer, encoding: BufferEncoding, done: TransformCallback): void {
		if (chunk.compare(OPUS_HEAD, 0, 8, 0, 8) === 0) {
			this.opusHead = chunk;
			this.emit('opusHead', chunk);
		} else if (chunk.compare(OPUS_TAGS, 0, 8, 0, 8) === 0) {
			this.opusTags = chunk;
			this.emit('opusTags', chunk);
		} else {
			let frame: Buffer | undefined;
			try {
				frame = this.encoder.decode(chunk);
			} catch (error) {
				done(error);
				return;
			}
			this.push(frame);
		}
		done();
	}
}

export function createOpusDecoderStream(options: OpusStreamConfig) {
	return new OpusDecoderStream(options);
}
