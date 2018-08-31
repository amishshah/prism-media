/* eslint-disable */

const prism = require('../');

test('Volume Transformers available', () => {
  expect(new prism.volume.PCMTransformer('s16le')).toBeTruthy();
  expect(new prism.volume.PCMTransformer('s16be')).toBeTruthy();
  expect(new prism.volume.PCMTransformer('s32le')).toBeTruthy();
  expect(new prism.volume.PCMTransformer('s32be')).toBeTruthy();
});
