import { Transform, TransformCallback, TransformOptions } from 'stream';
import { crc } from 'node-crc';

interface HeaderTypeFlag {
	continuedPacket: boolean;
	firstPage: boolean;
	lastPage: boolean;
}

function serialiseHeaderTypeFlag(flags: HeaderTypeFlag): number {
	return (flags.continuedPacket ? 0x01 : 0) + (flags.firstPage ? 0x02 : 0) + (flags.lastPage ? 0x04 : 0);
}

function createLacingValues(buffer: Buffer): number[] {
	const lacingValues = [];
	let i = buffer.length;
	while (i >= 255) {
		lacingValues.push(255);
		i -= 255;
	}
	lacingValues.push(i);
	return lacingValues;
}

const OggS = Buffer.from('OggS');

export type PageRateControl = { maxPackets: number } | { maxSegments: number };

export interface MuxerOptions extends TransformOptions {
	crc: boolean;
	pageRateControl: PageRateControl;
}

export abstract class OggMuxer extends Transform {
	protected packets: Buffer[];
	protected lacingValues: number[];
	protected readonly bitstream = 1;
	protected granulePosition = 0;
	protected pageSequence = 0;
	protected muxerOptions: MuxerOptions;
	protected pageRateController: (packet: Buffer, lacingValues: number[]) => boolean;

	public constructor(options?: Partial<MuxerOptions>) {
		super({ writableObjectMode: true, ...options });
		this.muxerOptions = {
			crc: true,
			pageRateControl: { maxSegments: 255 },
			...options,
		};
		this.packets = [];
		this.lacingValues = [];
		if (!this.muxerOptions.crc) {
			this.calculateCRC = () => 0;
		}
		if (Reflect.has(this.muxerOptions.pageRateControl, 'maxSegments')) {
			const { maxSegments } = this.muxerOptions.pageRateControl as { maxSegments: number };
			this.pageRateController = (packet: Buffer, lacingValues: number[]) =>
				lacingValues.length + this.lacingValues.length > maxSegments;
		} else {
			const { maxPackets } = this.muxerOptions.pageRateControl as { maxPackets: number };
			this.pageRateController = () => this.packets.length + 1 > maxPackets;
		}
	}

	protected writeLogicalHeaderPages(pages: Buffer[][]): void {
		for (const page of pages) {
			for (const packet of page) {
				this.writePacket(packet); // this assumes that writePacket will NOT call writePage
			}
			this.writePage(false, true);
		}
	}

	public _flush(callback: TransformCallback) {
		this.writePage(true);
		callback();
	}

	public _transform(chunk: Buffer, encoding: BufferEncoding, callback: TransformCallback) {
		this.writePacket(chunk);
		callback();
	}

	public calculateCRC(buffer: Buffer): number {
		const value = crc(32, false, 0x04c11db7, 0, 0, 0, 0, 0, buffer);
		if (typeof value === 'boolean') {
			throw new Error('Failed to computer CRC for buffer');
		}
		return value.readUInt32BE(0);
	}

	protected abstract calculateGranulePosition(packets: Buffer[]): number;

	public writePacket(packet: Buffer) {
		const lacingValues = createLacingValues(packet);
		if (lacingValues.length > 255) {
			throw new Error('OggMuxer does not support continued pages');
		}
		if (this.pageRateController(packet, lacingValues) || lacingValues.length + this.lacingValues.length > 255) {
			this.writePage();
		}
		this.packets.push(packet);
		this.lacingValues.push(...lacingValues);
	}

	public writePage(final = false, logicalHeader = false) {
		const header = Buffer.allocUnsafe(27);
		if (!logicalHeader) {
			this.granulePosition = this.calculateGranulePosition(this.packets);
		}
		OggS.copy(header, 0, 0); // capture_pattern
		header.writeUInt8(0, 4); // stream_structure_version
		header.writeUInt8(
			serialiseHeaderTypeFlag({
				continuedPacket: false,
				firstPage: this.pageSequence === 0,
				lastPage: final,
			}),
			5,
		); // header_type_flags
		header.writeUInt32LE(this.granulePosition, 6);
		header.writeUInt32LE(0, 10);
		header.writeUInt32LE(this.bitstream, 14); // stream_serial_number
		header.writeUInt32LE(this.pageSequence++, 18); // page_sequence_no
		header.writeUInt32LE(0, 22); // page checksum

		const data = Buffer.concat(this.packets);

		header.writeUInt8(this.lacingValues.length, 26);

		const total = Buffer.concat([header, Buffer.from(this.lacingValues), data]);
		total.writeUInt32LE(this.calculateCRC(total), 22);

		this.packets = [];
		this.lacingValues = [];

		this.push(total);
	}
}
