/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-require-imports */
import { Transform, TransformCallback, TransformOptions } from 'stream';

interface HeaderTypeFlag {
	continuedPacket: boolean;
	firstPage: boolean;
	lastPage: boolean;
}

/**
 * Serialises a HeaderTypeFlag
 */
function serialiseHeaderTypeFlag(flags: HeaderTypeFlag): number {
	return (flags.continuedPacket ? 0x01 : 0) + (flags.firstPage ? 0x02 : 0) + (flags.lastPage ? 0x04 : 0);
}

/**
 * Creates valid Ogg lacing values for a given Buffer.
 *
 * @param buffer The buffer to create lacing values for
 * @returns The lacing values
 */
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

/**
 * Used to control the size of generated created pages
 */
export type PageSizeControl = { maxPackets: number } | { maxSegments: number };

/**
 * Options used to configure an Ogg logical bitstream
 */
export interface LogicalBitstreamOptions extends TransformOptions {
	crc: boolean;
	pageSizeControl: PageSizeControl;
}

// Lazy loaded from node-crc
let crc: (
	bits: number,
	reflection: boolean,
	expL: number,
	expH: number,
	iniL: number,
	iniH: number,
	fixL: number,
	fixH: number,
	data: Buffer,
) => Buffer | boolean;

/**
 * Transforms an input stream of data into a logical Ogg bitstream that is compliant with the
 * Ogg framing specification {@link https://www.xiph.org/ogg/doc/framing.html}
 */
export abstract class OggLogicalBitstream extends Transform {
	protected packets: Buffer[];
	protected lacingValues: number[];
	protected readonly bitstream = 1;
	protected granulePosition = 0;
	protected pageSequence = 0;
	protected options: LogicalBitstreamOptions;
	protected pageSizeController: (packet: Buffer, lacingValues: number[]) => boolean;

	public constructor(options?: Partial<LogicalBitstreamOptions>) {
		super({ writableObjectMode: true, ...options });
		this.options = {
			crc: true,
			pageSizeControl: { maxSegments: 255 },
			...options,
		};
		this.packets = [];
		this.lacingValues = [];

		if (this.options.crc) {
			crc = require('node-crc').crc;
		} else {
			this.calculateCRC = () => 0;
		}

		if (Reflect.has(this.options.pageSizeControl, 'maxSegments')) {
			const { maxSegments } = this.options.pageSizeControl as { maxSegments: number };
			this.pageSizeController = (packet: Buffer, lacingValues: number[]) =>
				lacingValues.length + this.lacingValues.length > maxSegments;
		} else {
			const { maxPackets } = this.options.pageSizeControl as { maxPackets: number };
			this.pageSizeController = () => this.packets.length + 1 > maxPackets;
		}
	}

	/**
	 * Writes pages containing header data once the stream is created.
	 *
	 * @param pages The list of pages that should be written
	 */
	protected writeHeaderPages(pages: Buffer[][]): void {
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

	/**
	 * Calculates a valid CRC32 checksum for an Ogg page
	 *
	 * @param buffer The data
	 * @returns The checksum
	 */
	protected calculateCRC(buffer: Buffer): number {
		const value = crc(32, false, 0x04c11db7, 0, 0, 0, 0, 0, buffer);
		if (typeof value === 'boolean') {
			throw new Error('Failed to compute CRC for buffer');
		}
		return value.readUInt32BE(0);
	}

	/**
	 * Calculates the granule position of a page in the logical bitstream given the new packets of the page.
	 *
	 * @param packets The packets in the new page
	 */
	protected abstract calculateGranulePosition(packets: Buffer[]): number;

	/**
	 * Attempts to buffer a data packet. If there is already too much data buffered, the existing data is first
	 * flushed by collecting it into a page and pushing it.
	 *
	 * @param packet The data packet to write
	 */
	protected writePacket(packet: Buffer) {
		const lacingValues = createLacingValues(packet);
		if (lacingValues.length > 255) {
			throw new Error('OggLogicalBitstream does not support continued pages');
		}
		if (this.pageSizeController(packet, lacingValues) || lacingValues.length + this.lacingValues.length > 255) {
			this.writePage();
		}
		this.packets.push(packet);
		this.lacingValues.push(...lacingValues);
	}

	/**
	 * Collects the buffered data packets into an Ogg page.
	 *
	 * @param final Whether this is the final page to be written
	 * @param logicalHeader Whether this page contains only a header for a logical stream, to avoid
	 * incrementing the granule position.
	 */
	protected writePage(final = false, logicalHeader = false) {
		const header = Buffer.allocUnsafe(27);
		if (!logicalHeader) {
			this.granulePosition = this.calculateGranulePosition(this.packets);
		}
		// capture_pattern
		OggS.copy(header, 0, 0);

		// stream_structure_version
		header.writeUInt8(0, 4);

		// header_type_flag
		header.writeUInt8(
			serialiseHeaderTypeFlag({
				continuedPacket: false,
				firstPage: this.pageSequence === 0,
				lastPage: final,
			}),
			5,
		);

		// absolute granule position
		header.writeUInt32LE(this.granulePosition, 6);
		header.writeUInt32LE(0, 10);

		// stream serial number
		header.writeUInt32LE(this.bitstream, 14);

		// page sequence no
		header.writeUInt32LE(this.pageSequence++, 18);

		// page checksum - initially 0
		header.writeUInt32LE(0, 22);

		// page_segments
		header.writeUInt8(this.lacingValues.length, 26);

		const page = Buffer.concat([header, Buffer.from(this.lacingValues), ...this.packets]);

		// page checksum - calculate CRC checksum
		page.writeUInt32LE(this.calculateCRC(page), 22);

		// reset the buffered packets and their associated lacingValues
		this.packets = [];
		this.lacingValues = [];

		this.push(page);
	}
}
