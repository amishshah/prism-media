import { LogicalBitstreamOptions, OggLogicalBitstream } from './OggLogicalBitstream';
import { OpusHead, OpusTags, FRAME_SIZE_MAP } from '../opus/utils';
import { createReadStream, createWriteStream } from 'fs';
import { createOggOpusDemuxer } from '.';

export interface OggOpusLogicalBitstreamOptions extends Partial<LogicalBitstreamOptions> {
	opusHead: OpusHead;
	opusTags: OpusTags;
}

export type PartialOggOpusLogicalBitstreamOptions = Pick<OggOpusLogicalBitstreamOptions, 'opusHead'> &
	Partial<OggOpusLogicalBitstreamOptions>;

export class OggOpusLogicalBitstream extends OggLogicalBitstream {
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

createReadStream('/home/amish/Downloads/evermore/12.ogg')
	.pipe(createOggOpusDemuxer())
	.pipe(
		new OggOpusLogicalBitstream({
			opusHead: new OpusHead({
				channelCount: 2,
				sampleRate: 48000,
			}),
		}),
	)
	.pipe(createWriteStream('out3.ogg'));
