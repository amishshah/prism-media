export interface OpusHeadData {
	channelCount: number;
	preskip: number;
	sampleRate: number;
	outputGain: number;
}

export type PartialOpusHeadData = Pick<OpusHeadData, 'channelCount' | 'sampleRate'> & Partial<OpusHeadData>;

const OPUSHEAD = Buffer.from('OpusHead');

export class OpusHead implements OpusHeadData {
	public readonly channelCount: number;
	public readonly preskip: number;
	public readonly sampleRate: number;
	public readonly outputGain: number;

	public constructor(data: PartialOpusHeadData) {
		this.channelCount = data.channelCount;
		this.sampleRate = data.sampleRate;
		this.preskip = data.preskip ?? data.sampleRate * (80 / 1000); // 80ms of samples is a good default
		this.outputGain = data.outputGain ?? 0;
	}

	public toBuffer(): Buffer {
		const head = Buffer.alloc(19);
		OPUSHEAD.copy(head, 0, 0);
		head[8] = 1;
		head[9] = this.channelCount;
		head.writeUInt16LE(this.preskip, 10);
		head.writeUInt32LE(this.sampleRate, 12);
		head.writeUInt16LE(this.outputGain, 16);
		head[18] = 0;
		return head;
	}
}
