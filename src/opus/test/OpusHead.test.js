/* eslint-disable */

const OpusHead = require('../OpusHead');

test('Default OpusHead is valid', () => {
  let head = new OpusHead();
  expect(head.encode()).toEqual(Buffer.from(
    [0x4f, 0x70, 0x75, 0x73, 0x48, 0x65, 0x61, 0x64, 0x01, 0x02, 0x38, 0x01, 0x80, 0xbb, 0, 0, 0, 0, 0]
  ));

  head = OpusHead.from(head.encode());
  expect(head.version).toEqual(1);
  expect(head.outputChannelCount).toEqual(2);
  expect(head.preSkip).toEqual(312);
  expect(head.inputSampleRate).toEqual(48000);
  expect(head.outputGain).toEqual(0);
});

test('Custom OpusHead data', () => {
  const head = OpusHead.from(Buffer.from(
    [0x4f, 0x70, 0x75, 0x73, 0x48, 0x65, 0x61, 0x64, 0x01, 0x01, 0x7b, 0, 0x80, 0xbb, 0, 0, 0, 0x04, 0]
  ));
  expect(head.version).toEqual(1);
  expect(head.outputChannelCount).toEqual(1);
  expect(head.preSkip).toEqual(123);
  expect(head.inputSampleRate).toEqual(48000);
  expect(head.outputGain).toEqual(1024);
});

test('OpusHead throws on invalid data', () => {
  expect(() => OpusHead.from(Buffer.from('OpusFoot'))).toThrow();
});
