/* eslint-disable */

const Tag = require('../Tag');
const { OPUS_HEAD } = require('../../../opus/Constants');

const cases = [
  [
    // String
    ['MuxingApp', 'prism-media'],
    Buffer.from([0x4d, 0x80, 0x8b, 0x70, 0x72, 0x69, 0x73, 0x6d, 0x2d, 0x6d, 0x65, 0x64, 0x69, 0x61]),
  ],
  [
    // Unsigned Int
    ['TrackNumber', 1],
    Buffer.from([0xd7, 0x81, 0x01]),
  ],
  [
    // Binary
    ['CodecPrivate', OPUS_HEAD],
    Buffer.from([0x63, 0xa2, 0x88, ...OPUS_HEAD]),
  ],
  [
    // Single Precision Float
    ['SamplingFrequency', 48000],
    Buffer.from([0xb5, 0x84, 0x47, 0x3b, 0x80, 0]),
  ],
  [
    // Double Precision Float
    ['SamplingFrequency', Math.pow(2, 128)],
    Buffer.from([0xb5, 0x88, 0x47, 0xf0, 0, 0, 0, 0, 0, 0]),
  ],
  [
    // Signed Int
    ['TrackOffset', -10],
    Buffer.from([0x53, 0x7f, 0x81, 0xf6]),
  ]
]

test('EBML Tag encoding', () => {
  for (const [[id, value], output] of cases) {
    expect(new Tag(id, value).encode()).toEqual(output);
  }
});

test('EBML Tag throws when encoding invalid data', () => {
  expect(() => new Tag('SamplingFrequency', 'text').encode()).toThrow();
  expect(() => new Tag('TrackNumber', -10).encode()).toThrow();
  expect(() => new Tag('TrackNumber', '1').encode()).toThrow();
  expect(() => new Tag('DocType', '🐶').encode()).toThrow();
})