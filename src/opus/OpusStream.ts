import type { OpusEncoderOptions } from './adapters/OpusEncoder';
import { Transform, TransformOptions } from 'stream';
import { createOpusEncoder } from './loader';

export enum OpusApplication {
	VoIP = 2048,
	Audio = 2049,
	RestrictedLowDelay = 2051,
}

export interface OpusStreamConfig extends OpusEncoderOptions {
	streamOptions?: TransformOptions;
}

export class OpusStream extends Transform {
	protected readonly encoder;
	protected readonly pcmLength;

	public constructor(config: OpusStreamConfig) {
		super(config.streamOptions);
		this.encoder = createOpusEncoder({
			channels: config.channels,
			frameSize: config.frameSize,
			rate: config.rate,
		});
		// *2 because each sample is 2 bytes
		this.pcmLength = config.frameSize * config.channels * 2;
	}

	protected encode(buffer: Buffer) {
		return this.encoder.encode(buffer);
	}

	protected decode(buffer: Buffer) {
		return this.encoder.decode(buffer);
	}

	public _destroy(error: Error | null, callback: (error: Error | null) => void): void {
		this.cleanup();
		callback(error);
	}

	public _final(callback: (error?: Error | null) => void): void {
		this.cleanup();
		callback();
	}

	private cleanup() {
		this.encoder.delete();
	}
}
