import { Transform, TransformCallback, TransformOptions } from 'stream';

enum VolumeTransformerType {
	S16LE = 's16le',
	S16BE = 's16be',
	S32LE = 's32le',
	S32BE = 's32be',
}

interface VolumeTransformerConfig {
	type: VolumeTransformerType;
	volume: number;
	streamOptions?: TransformOptions;
}

export class VolumeTransformer extends Transform {
	private buffer = Buffer.alloc(0);
	private readonly bytes: number;
	private readonly extrema: [number, number];

	public readonly volume: number;

	public constructor(config: VolumeTransformerConfig) {
		super(config.streamOptions);
		this.volume = config.volume;

		switch (config.type) {
			case VolumeTransformerType.S16LE:
				this.readInt = (buffer, index) => buffer.readInt16LE(index);
				this.writeInt = (buffer, value, index) => buffer.writeInt16LE(value, index);
				break;
			case VolumeTransformerType.S16BE:
				this.readInt = (buffer, index) => buffer.readInt16BE(index);
				this.writeInt = (buffer, value, index) => buffer.writeInt16BE(value, index);
				break;
			case VolumeTransformerType.S32LE:
				this.readInt = (buffer, index) => buffer.readInt32LE(index);
				this.writeInt = (buffer, value, index) => buffer.writeInt32LE(value, index);
				break;
			case VolumeTransformerType.S32BE:
				this.readInt = (buffer, index) => buffer.readInt32BE(index);
				this.writeInt = (buffer, value, index) => buffer.writeInt32BE(value, index);
				break;
		}

		const bits = config.type === VolumeTransformerType.S16LE || config.type === VolumeTransformerType.S16BE ? 16 : 32;
		this.bytes = Math.floor(bits / 8);
		this.extrema = [-Math.pow(2, bits - 1), Math.pow(2, bits - 1) - 1];
	}

	private readInt(buffer: Buffer, index: number): number;
	private readInt(): number {
		throw new Error('readInt is unimplemented');
	}

	private writeInt(buffer: Buffer, value: number, index: number): number;
	private writeInt(): number {
		throw new Error('writeInt is unimplemented');
	}

	private clamp(value: number) {
		const [neg, pos] = this.extrema;
		return Math.min(pos, Math.max(neg, value));
	}

	public _transform(newChunk: Buffer, encoding: BufferEncoding, done: TransformCallback): void {
		// Act as passthrough for volume 1
		if (this.volume === 1) {
			this.push(newChunk);
			done();
			return;
		}

		const { bytes } = this;
		const chunk = Buffer.concat([this.buffer, newChunk]);

		const readableLength = Math.floor(chunk.length / bytes);

		let i = 0;
		while (i < readableLength) {
			this.writeInt(chunk, this.clamp(this.readInt(chunk, i) * this.volume), i);
			i += bytes;
		}

		this.buffer = chunk.slice(readableLength);
		this.push(chunk.slice(0, readableLength));
		done();
	}
}

export function createVolumeTransformer(config: Partial<VolumeTransformerConfig>) {
	return new VolumeTransformer({
		type: VolumeTransformerType.S16LE,
		volume: 1,
		...config,
	});
}
