import type { TransformCallback } from 'stream';
import { OpusStream, OpusStreamConfig } from './OpusStream';

export class Encoder extends OpusStream {
	private buffer: Buffer;

	public constructor(options: OpusStreamConfig) {
		super({
			...options,
			streamOptions: {
				...options.streamOptions,
				readableObjectMode: true,
			},
		});
		this.buffer = Buffer.allocUnsafe(0);
	}

	public _transform(newChunk: Buffer, encoding: BufferEncoding, done: TransformCallback): void {
		const chunk = Buffer.concat([this.buffer, newChunk]);

		let i = 0;
		while (chunk.length >= i + this.pcmLength) {
			const pcm = chunk.slice(i, i + this.pcmLength);
			let opus: Buffer | undefined;
			try {
				opus = this.encoder.encode(pcm);
			} catch (error) {
				done(error);
				return;
			}
			this.push(opus);
			i += this.pcmLength;
		}

		if (i > 0) this.buffer = chunk.slice(i);
		done();
	}

	public applyCTL(ctl: number, value: number): void {
		this.encoder.applyEncoderCTL(ctl, value);
	}
}
