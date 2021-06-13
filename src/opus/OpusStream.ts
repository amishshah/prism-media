import type { OpusEncoder, OpusEncoderOptions } from './adapters/OpusEncoder';
import { Transform, TransformOptions } from 'stream';
import { createOpusEncoder } from './loader';

export enum OpusApplication {
	VoIP = 2048,
	Audio = 2049,
	RestrictedLowDelay = 2051,
}

export enum OpusCTL {
	SetBitrate = 4002,
	SetFEC = 4012,
	SetPLP = 4014,
}

export interface OpusStreamConfig extends OpusEncoderOptions {
	streamOptions?: TransformOptions;
}

export abstract class OpusStream extends Transform {
	protected readonly encoder: OpusEncoder;
	protected readonly pcmLength: number;

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

	public abstract applyCTL(ctl: number, value: number): void;

	public setBitrate(bitrate: number) {
		return this.applyCTL(OpusCTL.SetBitrate, bitrate);
	}

	public setFEC(enabled: boolean) {
		return this.applyCTL(OpusCTL.SetFEC, enabled ? 1 : 0);
	}

	public setPLP(percentage: number) {
		return this.applyCTL(OpusCTL.SetPLP, Math.min(100, Math.max(0, percentage * 100)));
	}

	private cleanup() {
		this.encoder.delete();
	}
}
