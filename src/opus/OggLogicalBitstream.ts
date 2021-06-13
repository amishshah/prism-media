import {
	LogicalBitstreamOptions,
	OggLogicalBitstream as AbstractOggLogicalBitstream,
} from '../ogg/OggLogicalBitstream';
import { OpusHead, OpusTags, FRAME_SIZE_MAP } from './utils';

export interface OggOpusLogicalBitstreamOptions extends Partial<LogicalBitstreamOptions> {
	opusHead: OpusHead;
	opusTags: OpusTags;
}

export type PartialOggOpusLogicalBitstreamOptions = Pick<OggOpusLogicalBitstreamOptions, 'opusHead'> &
	Partial<OggOpusLogicalBitstreamOptions>;

/**
 * Transforms an object stream of Opus objects into a logical Ogg Opus stream that is compliant
 * with RFC7845 {@link https://tools.ietf.org/html/rfc7845}
 */
export class OggLogicalBitstream extends AbstractOggLogicalBitstream {
	public readonly opusHead: OpusHead;
	public readonly opusTags: OpusTags;

	public constructor(options: PartialOggOpusLogicalBitstreamOptions) {
		super(options);
		this.opusHead = options.opusHead;
		this.opusTags = options.opusTags ?? new OpusTags();
		this.writeHeaderPages([[options.opusHead.toBuffer()], [this.opusTags.toBuffer()]]);
	}

	protected calculateGranulePosition(packets: Buffer[]): number {
		const sampleRate = this.opusHead.sampleRate / 1000;
		const newCount = packets.reduce((acc, val) => acc + sampleRate * FRAME_SIZE_MAP[val[0] >> 3], 0);
		return this.granulePosition + newCount;
	}
}
