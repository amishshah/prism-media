/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-require-imports */
import { OpusEncoder as AbstractOpusEncoder, OpusEncoderOptions } from '../OpusEncoder';

export class OpusScriptEncoder extends AbstractOpusEncoder {
	private readonly encoder: any;

	public constructor(options: OpusEncoderOptions) {
		super(options);
		const OpusEncoder = require('opusscript');
		this.encoder = new OpusEncoder(options.rate, options.channels);
	}

	public encode(buffer: Buffer): Buffer {
		return this.encoder.encode(buffer, this.options.frameSize);
	}

	public decode(buffer: Buffer): Buffer {
		return this.encoder.decode(buffer);
	}

	public delete(): void {
		this.encoder.delete();
	}
}
