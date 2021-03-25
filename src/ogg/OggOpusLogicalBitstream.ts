import { LogicalBitstreamOptions, OggLogicalBitstream } from './OggLogicalBitstream';
import { OpusHead, OpusTags, FRAME_SIZE_MAP } from '../opus/utils';

export interface OggOpusLogicalBitstreamOptions extends Partial<LogicalBitstreamOptions> {
	opusHead: OpusHead;
	opusTags: OpusTags;
}

export class OggOpusLogicalBitstream extends OggLogicalBitstream {
	public readonly opusHead: OpusHead;
	public readonly opusTags: OpusTags;

	public constructor(options: OggOpusLogicalBitstreamOptions) {
		super(options);
		this.opusHead = options.opusHead;
		this.opusTags = options.opusTags;
		this.writeLogicalHeaderPages([[options.opusHead.toBuffer()], [options.opusTags.toBuffer()]]);
	}

	protected calculateGranulePosition(packets: Buffer[]): number {
		const sampleRate = this.opusHead.data.sampleRate / 1000;
		const newCount = packets.reduce((acc, val) => acc + sampleRate * FRAME_SIZE_MAP[val[0] >> 3], 0);
		return this.granulePosition + newCount;
	}
}
