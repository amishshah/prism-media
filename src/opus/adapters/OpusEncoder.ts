export interface OpusEncoderOptions {
	rate: 8000 | 12000 | 16000 | 24000 | 48000;
	channels: 1 | 2;
	frameSize: number;
}

export abstract class OpusEncoder {
	protected readonly options: OpusEncoderOptions;

	public constructor(options: OpusEncoderOptions) {
		this.options = options;
	}

	public abstract encode(buffer: Buffer): Buffer;
	public abstract decode(buffer: Buffer): Buffer;
	public abstract applyEncoderCTL(ctl: number, value: number): void;
	public abstract applyDecoderCTL(ctl: number, value: number): void;
	public abstract delete(): void;
}
