/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-require-imports */
import { OpusEncoder as AbstractOpusEncoder, OpusEncoderOptions } from './OpusEncoder';

export class EvanOpusEncoder extends AbstractOpusEncoder {
	private readonly encoder: any;
	private readonly decoder: any;

	public constructor(options: OpusEncoderOptions) {
		super(options);
		const { Encoder, Decoder } = require('@evan/opus');
		this.encoder = new Encoder({ channels: options.channels, sample_rate: options.rate });
		this.decoder = new Decoder({ channels: options.channels, sample_rate: options.rate });
	}

	public encode(buffer: Buffer): Buffer {
		return this.encoder.encode(buffer);
	}

	public decode(buffer: Buffer): Buffer {
		return this.decoder.decode(buffer);
	}

	public applyEncoderCTL(ctl: number, value: number): void {
		this.encoder.ctl(ctl, value);
	}

	public applyDecoderCTL(ctl: number, value: number): void {
		this.decoder.ctl(ctl, value);
	}

	public delete(): void {
		if (this.encoder.drop) {
			this.encoder.drop();
			this.decoder.drop();
		}
	}
}
