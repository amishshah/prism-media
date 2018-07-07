/* eslint-disable */

const prism = require('../');

test('Volume Transformers available', () => {
  expect(prism.VolumeTransformer16LE).toBeTruthy();
  expect(prism.VolumeTransformer16BE).toBeTruthy();
  expect(prism.VolumeTransformer32LE).toBeTruthy();
  expect(prism.VolumeTransformer32BE).toBeTruthy();
});
