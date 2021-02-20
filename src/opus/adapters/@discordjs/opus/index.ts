/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-require-imports */
import { OpusEncoder as AbstractOpusEncoder, OpusEncoderOptions } from '../../OpusEncoder';

export class DiscordJSOpusEncoder extends AbstractOpusEncoder {
	private readonly encoder: any;

	public constructor(options: OpusEncoderOptions) {
		super(options);
		const { OpusEncoder } = require('@discordjs/opus');
		this.encoder = new OpusEncoder(options.rate, options.channels);
	}

	public encode(buffer: Buffer): Buffer {
		return this.encoder.encode(buffer);
	}

	public decode(buffer: Buffer): Buffer {
		return this.encoder.decode(buffer);
	}

	// eslint-disable-next-line @typescript-eslint/no-empty-function
	public delete(): void {}
}
