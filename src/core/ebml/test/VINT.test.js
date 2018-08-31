/* eslint-disable */

const VINT = require('../VINT');

const LIVE_STREAM = Buffer.from([0x01, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff]);

const cases = [
  [0x1A41FE, Buffer.from([0x3A, 0x41, 0xFE])],
  [0, Buffer.from([0x80])],
  [1, Buffer.from([0x81])],
  [511, Buffer.from([0x41, 0xff])],
  [Infinity, LIVE_STREAM],
];

test('VINT encoding', () => {
  for (const [input, output] of cases) {
    expect(VINT.encode(input)).toEqual(output);
  }
});

test('VINT decoding', () => {
  for (const [input, output] of cases) {
    expect(VINT.decode(output).value).toEqual(input);
  }
});
