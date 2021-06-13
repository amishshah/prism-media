import { createReadStream } from 'fs';
import { streamToBuffer } from './util';
import { createOggOpusDemuxer, createOpusDecoderStream, createWebmOpusDemuxer } from '../src';

test('OggOpusDemuxer is sane', async () => {
	expect.assertions(1);
	const output = createReadStream('./test/audio/speech_orig.ogg')
		.pipe(createOggOpusDemuxer())
		.pipe(createOpusDecoderStream({ rate: 48000, channels: 1, frameSize: 960 }));
	const chunks = await streamToBuffer(output);
	expect(chunks.length).toBeGreaterThanOrEqual(103e3);
});

test('opus.WebmDemuxer is sane', async () => {
	expect.assertions(1);
	const output = createReadStream('./test/audio/speech_orig.webm')
		.pipe(createWebmOpusDemuxer())
		.pipe(createOpusDecoderStream({ rate: 48000, channels: 1, frameSize: 960 }));
	const chunks = await streamToBuffer(output);
	expect(chunks.length).toBeGreaterThanOrEqual(103e3);
});
