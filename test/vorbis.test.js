/* eslint-disable */

const prism = require('../');

test('vorbis.WebmDemuxer available', () => {
  expect(prism.vorbis.WebmDemuxer).toBeTruthy();
  expect(prism.vorbis.WebmDemuxer.TOO_SHORT).toBeTruthy();
  expect(prism.vorbis.WebmDemuxer.TAGS).toBeTruthy();
});