export interface OpusHeadData {
	channelCount: number;
	preskip: number;
	sampleRate: number;
	outputGain: number;
}

const OPUSHEAD = Buffer.from('OpusHead');

export class OpusHead {
	public readonly data: OpusHeadData;
	public constructor(data: OpusHeadData) {
		this.data = data;
	}

	public toBuffer(): Buffer {
		const head = Buffer.alloc(19);
		OPUSHEAD.copy(head, 0, 0);
		head[8] = 1;
		head[9] = this.data.channelCount;
		head.writeUInt16LE(this.data.preskip, 10);
		head.writeUInt32LE(this.data.sampleRate, 12);
		head.writeUInt16LE(this.data.outputGain, 16);
		head[18] = 0;
		return head;
	}
}
