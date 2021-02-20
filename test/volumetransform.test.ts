import { streamToBuffer } from './util';
import { Readable } from 'stream';
import { createVolumeTransformer, VolumeTransformerType } from '../src';

const fixturesAll = [
	{
		test: [1, 2, 3],
		expected: [1, 2, 3],
		volume: 1,
	},
	{
		test: [1, -2, 3, -4, 5],
		expected: [0, 0, 0, 0, 0],
		volume: 0,
	},
	{
		test: [1, 2, 3, 4, 5],
		expected: [2, 4, 6, 8, 10],
		volume: 2,
	},
	{
		test: [-2, -1, 0, 1, 2],
		expected: [-60, -30, 0, 30, 60],
		volume: 30,
	},
	{
		test: [1, 1, 1],
		expected: [0, 0, 0],
		volume: 0.5,
	},
	{
		test: [1, 2, 3, 4, 5, 6, 7, 8, 9],
		expected: [0, 1, 1, 2, 2, 3, 3, 4, 4],
		volume: 0.5,
	},
];

const MAX_16 = 2 ** 15;
const MAX_32 = 2 ** 31;

const fixtures16 = [
	{
		test: [1, 2, 4, 8, 16],
		expected: [MAX_16 - 1, MAX_16 - 1, MAX_16 - 1, MAX_16 - 1, MAX_16 - 1],
		volume: 2 ** 40,
	},
	{
		test: [1, -1],
		expected: [MAX_16 - 1, -MAX_16],
		volume: 2 ** 40,
	},
];

const fixtures32 = [
	{
		test: [1, 2, 4, 8, 16],
		expected: [MAX_32 - 1, MAX_32 - 1, MAX_32 - 1, MAX_32 - 1, MAX_32 - 1],
		volume: 2 ** 40,
	},
	{
		test: [1, -1],
		expected: [MAX_32 - 1, -MAX_32],
		volume: 2 ** 40,
	},
];

function writeBuffer(ints: number[], format: string) {
	let buffer: Buffer;
	switch (format) {
		case 's16le':
			buffer = Buffer.allocUnsafe(ints.length * 2);
			ints.forEach((value, i) => buffer.writeInt16LE(value, i * 2));
			break;
		case 's16be':
			buffer = Buffer.allocUnsafe(ints.length * 2);
			ints.forEach((value, i) => buffer.writeInt16BE(value, i * 2));
			break;
		case 's32le':
			buffer = Buffer.allocUnsafe(ints.length * 4);
			ints.forEach((value, i) => buffer.writeInt32LE(value, i * 4));
			break;
		case 's32be':
			buffer = Buffer.allocUnsafe(ints.length * 4);
			ints.forEach((value, i) => buffer.writeInt32BE(value, i * 4));
			break;
		default:
			throw new Error(`Unknown type '${format}'`);
	}
	return buffer;
}

async function testVolume(type: VolumeTransformerType) {
	const fixtures = fixturesAll.concat(type.includes('16') ? fixtures16 : fixtures32);
	expect.assertions(fixtures.length);
	for (const { test, expected, volume } of fixtures) {
		const output = Readable.from(writeBuffer(test, type)).pipe(createVolumeTransformer({ type, volume }));

		const buffer = await streamToBuffer(output);
		expect(buffer).toEqual(writeBuffer(expected, type));
	}
}

test('Volume Transformer S16LE', () => testVolume(VolumeTransformerType.S16LE));
test('Volume Transformer S16BE', () => testVolume(VolumeTransformerType.S16BE));
test('Volume Transformer S32LE', () => testVolume(VolumeTransformerType.S32LE));
test('Volume Transformer S32BE', () => testVolume(VolumeTransformerType.S32LE));
