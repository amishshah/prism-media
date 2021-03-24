import { MuxerOptions, OggMuxer } from './OggMuxer';
import { OpusHead, OpusTags, FRAME_SIZE_MAP } from '../opus/utils';

export interface OggOpusMuxerOptions extends Partial<MuxerOptions> {
	opusHead: OpusHead;
	opusTags: OpusTags;
}

export class OggOpusMuxer extends OggMuxer {
	public readonly opusHead: OpusHead;
	public readonly opusTags: OpusTags;

	public constructor(options: OggOpusMuxerOptions) {
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
