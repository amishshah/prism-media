import { Transform, TransformCallback, TransformOptions } from 'stream';

const OGG_PAGE_HEADER_SIZE = 26;
const STREAM_STRUCTURE_VERSION = 0;

const charCode = (x: string) => x.charCodeAt(0);
const OGGS_HEADER = Buffer.from([...'OggS'].map(charCode));
const OPUS_HEAD = Buffer.from([...'OpusHead'].map(charCode));
const OPUS_TAGS = Buffer.from([...'OpusTags'].map(charCode));

export class OggOpusDemuxer extends Transform {
	private _remainder?: Buffer;
	private _bitstream?: number;
	private _head?: Buffer;

	public constructor(options?: TransformOptions) {
		super({ ...options, readableObjectMode: true });
	}

	public _transform(chunk: Buffer, encoding: BufferEncoding, done: TransformCallback) {
		if (this._remainder) {
			chunk = Buffer.concat([this._remainder, chunk]);
			this._remainder = undefined;
		}

		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		while (true) {
			const result = this._readPage(chunk);
			if (result) chunk = result;
			else break;
		}
		this._remainder = chunk;
		done();
	}

	public _readPage(chunk: Buffer) {
		if (chunk.length < OGG_PAGE_HEADER_SIZE) {
			return false;
		}
		if (chunk.compare(OGGS_HEADER, 0, 4, 0, 4) !== 0) {
			throw Error(`capture_pattern is not OGGS_HEADER`);
		}
		if (chunk.readUInt8(4) !== STREAM_STRUCTURE_VERSION) {
			throw Error(`stream_structure_version is not ${STREAM_STRUCTURE_VERSION}`);
		}

		if (chunk.length < 27) return false;
		const pageSegments = chunk.readUInt8(26);
		if (chunk.length < 27 + pageSegments) return false;
		const table = chunk.slice(27, 27 + pageSegments);
		const bitstream = chunk.readUInt32BE(14);

		const sizes = [];
		let totalSize = 0;

		for (let i = 0; i < pageSegments; ) {
			let size = 0;
			let x = 255;
			while (x === 255) {
				if (i >= table.length) return false;
				x = table.readUInt8(i);
				i++;
				size += x;
			}
			sizes.push(size);
			totalSize += size;
		}

		if (chunk.length < 27 + pageSegments + totalSize) return false;

		let start = 27 + pageSegments;
		for (const size of sizes) {
			const segment = chunk.slice(start, start + size);
			if (this._head) {
				if (segment.compare(OPUS_TAGS, 0, 8, 0, 8) === 0) this.emit('tags', segment);
				else if (this._bitstream === bitstream) this.push(segment);
			} else if (segment.compare(OPUS_HEAD, 0, 8, 0, 8) === 0) {
				this.emit('head', segment);
				this._head = segment;
				this._bitstream = bitstream;
			} else {
				this.emit('unknownSegment', segment);
			}
			start += size;
		}
		return chunk.slice(start);
	}

	public _destroy(err: Error | null, cb: (error: Error | null) => void): void {
		this._cleanup();
		cb(err);
	}

	public _final(cb: (error?: Error) => void): void {
		this._cleanup();
		cb();
	}

	public _cleanup() {
		this._remainder = undefined;
		this._head = undefined;
		this._bitstream = undefined;
	}
}

export function createOggOpusDemuxer(options?: TransformOptions) {
	return new OggOpusDemuxer(options);
}
