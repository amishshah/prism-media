export interface OpusTagsData {
	vendor: string;
	tags?: Record<string, string>;
}

export type PartialOpusTagsData = Partial<OpusTagsData>;

const OPUSTAGS = Buffer.from('OpusTags');

export class OpusTags {
	public readonly data: OpusTagsData;
	public constructor(data: PartialOpusTagsData = {}) {
		this.data = {
			vendor: 'prism-media',
			...data,
		};
	}

	public toBuffer(): Buffer {
		const head = Buffer.alloc(8 + (4 + this.data.vendor.length) + 4); // magic signature, vendor, string count
		OPUSTAGS.copy(head, 0, 0);
		head.writeUInt32LE(this.data.vendor.length, 8);
		Buffer.from(this.data.vendor).copy(head, 12);
		head.writeUInt32LE(Object.keys(this.data.tags ?? {}).length, 12 + this.data.vendor.length);
		return Buffer.concat([
			head,
			...Object.entries(this.data.tags ?? {}).flatMap(([key, value]) => {
				const size = Buffer.allocUnsafe(4);
				size.writeUInt32LE(key.length + value.length + 1, 0);
				return [size, Buffer.from(`${key}=${value}`)];
			}),
		]);
	}

	public static from(buffer: Buffer): OpusTags {
		if (!buffer.slice(0, 8).equals(OPUSTAGS)) throw new Error('not opus tags');
		const vendorSize = buffer.readUInt32LE(8);
		const vendor = buffer.slice(12, 12 + vendorSize).toString('utf-8');
		let tagsRemaining = buffer.readUInt32LE(12 + vendorSize);
		let i = 12 + vendorSize + 4;
		const tags: Record<string, string> = {};
		while (tagsRemaining--) {
			const tagSize = buffer.readUInt32LE(i);
			i += 4;
			const tag = buffer.slice(i, i + tagSize).toString('utf-8');
			i += tag.length;
			const [key, value] = tag.split('=');
			tags[key] = value;
		}
		return new OpusTags({ vendor, tags });
	}
}
