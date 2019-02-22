/* eslint-disable */

const prism = require('../');
const { streamToBuffer } = require('./util');
const { Readable } = require('stream');

class AudioSource extends Readable {
  constructor(options) {
    super(options);
    this._writeData = options.data;
  }

  _read() {
    this.push(this._writeData);
    this.push(null);
  }
}

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

function writeBuffer(ints, format) {
  let buffer;
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

test('Volume Transformers available', () => {
  expect(new prism.VolumeTransformer({ type: 's16le' })).toBeTruthy();
  expect(new prism.VolumeTransformer({ type: 's16be' })).toBeTruthy();
  expect(new prism.VolumeTransformer({ type: 's32le' })).toBeTruthy();
  expect(new prism.VolumeTransformer({ type: 's32be' })).toBeTruthy();
  expect(() => new prism.VolumeTransformer({ type: 'transformer boi' })).toThrow();
});

async function testVolume(type) {
  let fixtures = fixturesAll.concat(type.includes('16') ? fixtures16 : fixtures32);
  expect.assertions(fixtures.length);
  for (const { test, expected, volume } of fixtures) {
    const output = new AudioSource({ data: writeBuffer(test, type) })
      .pipe(new prism.VolumeTransformer({ type, volume }));

    const buffer = await streamToBuffer(output);
    expect(buffer).toEqual(writeBuffer(expected, type));
  }
}

test('Volume Transformer S16LE', () => testVolume('s16le'));
test('Volume Transformer S16BE', () => testVolume('s16be'));
test('Volume Transformer S32LE', () => testVolume('s32le'));
test('Volume Transformer S32BE', () => testVolume('s32be'));
