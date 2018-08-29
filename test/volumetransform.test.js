/* eslint-disable */

const prism = require('../');

test('Volume Transformers available', () => {
  expect(new prism.volume.PCMTransformer({ type: 's16le' })).toBeTruthy();
  expect(new prism.volume.PCMTransformer({ type: 's16be' })).toBeTruthy();
  expect(new prism.volume.PCMTransformer({ type: 's32le' })).toBeTruthy();
  expect(new prism.volume.PCMTransformer({ type: 's32be' })).toBeTruthy();
});
