import { Transform, TransformCallback, TransformOptions } from 'stream';

interface Track {
	type: number;
	number: number;
}

export type ParseResult =
	| typeof TOO_SHORT
	| [
			undefined,
			{
				offset: number;
				_skipUntil?: number;
			},
	  ]
	| [Error];

export abstract class WebmBaseDemuxer extends Transform {
	private _remainder?: Buffer;
	private _length = 0;
	private _count = 0;
	private _ebmlFound = false;
	private _skipUntil?: number;
	private _incompleteTrack: Partial<Track>;
	private _track?: Track;

	public constructor(options?: TransformOptions) {
		super(Object.assign({ readableObjectMode: true }, options));
		this._incompleteTrack = {};
	}

	public _transform(chunk: Buffer, encoding: BufferEncoding, done: TransformCallback) {
		this._length += chunk.length;
		if (this._remainder) {
			chunk = Buffer.concat([this._remainder, chunk]);
			this._remainder = undefined;
		}
		let offset = 0;
		if (this._skipUntil && this._length > this._skipUntil) {
			offset = this._skipUntil - this._count;
			this._skipUntil = undefined;
		} else if (this._skipUntil) {
			this._count += chunk.length;
			return done();
		}
		let result;
		while (typeof result !== 'symbol') {
			result = this._readTag(chunk, offset);
			if (typeof result === 'symbol') break;
			const [error, info] = result;
			if (error) return done(error);
			const { offset: newOffset, _skipUntil: skipUntil } = info!;
			if (skipUntil) {
				this._skipUntil = skipUntil;
				break;
			}
			if (newOffset) offset = newOffset;
			else break;
		}
		this._count += offset;
		this._remainder = chunk.slice(offset);
		return done();
	}

	private _readEBMLId(chunk: Buffer, offset: number) {
		const idLength = vintLength(chunk, offset);
		if (typeof idLength === 'symbol') return TOO_SHORT;
		return {
			id: chunk.slice(offset, offset + idLength),
			offset: offset + idLength,
		};
	}

	private _readTagDataSize(chunk: Buffer, offset: number) {
		const sizeLength = vintLength(chunk, offset);
		if (typeof sizeLength === 'symbol') return TOO_SHORT;
		const dataLength = expandVint(chunk, offset, offset + sizeLength);
		return { offset: offset + sizeLength, dataLength, sizeLength };
	}

	private _readTag(chunk: Buffer, offset: number): ParseResult {
		const idData = this._readEBMLId(chunk, offset);
		if (typeof idData === 'symbol') return TOO_SHORT;
		const ebmlID = idData.id.toString('hex');
		if (!this._ebmlFound) {
			if (ebmlID === '1a45dfa3') this._ebmlFound = true;
			else return [new Error('Did not find the EBML tag at the start of the stream')];
		}
		offset = idData.offset;
		const sizeData = this._readTagDataSize(chunk, offset);
		if (typeof sizeData === 'symbol') return TOO_SHORT;
		const { dataLength } = sizeData;
		if (typeof dataLength === 'symbol') return TOO_SHORT;
		offset = sizeData.offset;
		// If this tag isn't useful, tell the stream to stop processing data until the tag ends
		if (!TAGS.hasOwnProperty(ebmlID)) {
			if (chunk.length > offset + dataLength) {
				return [undefined, { offset: offset + dataLength }];
			}
			return [undefined, { offset, _skipUntil: this._count + offset + dataLength }];
		}

		const tagHasChildren = (TAGS as any)[ebmlID] as boolean;
		if (tagHasChildren) {
			return [undefined, { offset }];
		}

		if (offset + dataLength > chunk.length) return TOO_SHORT;
		const data = chunk.slice(offset, offset + dataLength);
		if (!this._track) {
			if (ebmlID === 'ae') this._incompleteTrack = {};
			if (ebmlID === 'd7') this._incompleteTrack.number = data[0];
			if (ebmlID === '83') this._incompleteTrack.type = data[0];
			if (this._incompleteTrack.type === 2 && typeof this._incompleteTrack.number !== 'undefined') {
				this._track = this._incompleteTrack as any;
			}
		}
		if (ebmlID === '63a2') {
			const error = this._checkHead(data);
			if (error) return [error];
		} else if (ebmlID === 'a3') {
			if (!this._track) return [new Error('No audio track in this webm!')];
			if ((data[0] & 0xf) === this._track.number) {
				this.push(data.slice(4));
			}
		}
		return [undefined, { offset: offset + dataLength }];
	}

	public _destroy(err: Error | null, cb: (error: Error | null) => void): void {
		this._cleanup();
		cb(err);
	}

	public _final(cb: (error?: Error) => void) {
		this._cleanup();
		cb();
	}

	/**
	 * Cleans up the demuxer when it is no longer required.
	 * @private
	 */
	public _cleanup() {
		this._remainder = undefined;
		this._incompleteTrack = {};
		this._track = undefined;
	}

	protected abstract _checkHead(buffer: Buffer): Error | undefined;
}

const TOO_SHORT = Symbol('TOO_SHORT');

const TAGS = {
	// value is true if the element has children
	'1a45dfa3': true, // EBML
	'18538067': true, // Segment
	'1f43b675': true, // Cluster
	'1654ae6b': true, // Tracks
	ae: true, // TrackEntry
	d7: false, // TrackNumber
	'83': false, // TrackType
	a3: false, // SimpleBlock
	'63a2': false,
};

function vintLength(buffer: Buffer, index: number) {
	let i = 0;
	for (; i < 8; i++) if ((1 << (7 - i)) & buffer[index]) break;
	i++;
	if (index + i > buffer.length) {
		return TOO_SHORT;
	}
	return i;
}

function expandVint(buffer: Buffer, start: number, end: number) {
	const length = vintLength(buffer, start);
	if (end > buffer.length || typeof length !== 'number') return TOO_SHORT;
	const mask = (1 << (8 - length)) - 1;
	let value = buffer[start] & mask;
	for (let i = start + 1; i < end; i++) {
		value = (value << 8) + buffer[i];
	}
	return value;
}
