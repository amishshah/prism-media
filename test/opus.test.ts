import { createReadStream } from 'fs';
import { streamToBuffer } from './util';
import { opus } from '../src';

test('opus.OggDemuxer is sane', async () => {
	expect.assertions(1);
	const output = createReadStream('./test/audio/speech_orig.ogg')
		.pipe(new opus.OggDemuxer())
		.pipe(new opus.Decoder({ rate: 48000, channels: 1, frameSize: 960 }));
	const chunks = await streamToBuffer(output);
	expect(chunks.length).toBeGreaterThanOrEqual(103e3);
});

test('opus.WebmDemuxer is sane', async () => {
	expect.assertions(1);
	const output = createReadStream('./test/audio/speech_orig.webm')
		.pipe(new opus.WebmDemuxer())
		.pipe(new opus.Decoder({ rate: 48000, channels: 1, frameSize: 960 }));
	const chunks = await streamToBuffer(output);
	expect(chunks.length).toBeGreaterThanOrEqual(103e3);
});
