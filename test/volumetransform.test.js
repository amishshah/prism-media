/* eslint-disable */

const prism = require('../');

test('Volume Transformers available', () => {
  expect(new prism.VolumeTransformer({ type: 's16le' })).toBeTruthy();
  expect(new prism.VolumeTransformer({ type: 's16be' })).toBeTruthy();
  expect(new prism.VolumeTransformer({ type: 's32le' })).toBeTruthy();
  expect(new prism.VolumeTransformer({ type: 's32be' })).toBeTruthy();
  expect(() => new prism.VolumeTransformer({ type: 'transformer boi' })).toThrow();
});
