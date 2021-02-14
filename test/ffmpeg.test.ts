import fs from 'fs';
import { promisify } from 'util';
const readFile = promisify(fs.readFile);
import { roughlyEquals, streamToBuffer } from './util';
import { createFFmpeg } from '../src';

test('FFmpeg transcoder to PCM is sane', async (done) => {
	expect.assertions(1);
	const output = fs
		.createReadStream('./test/audio/speech_orig.ogg')
		.pipe(
			createFFmpeg(['-i', '-', '-analyzeduration', '0', '-loglevel', '0', '-f', 's16le', '-ar', '48000', '-ac', '2']),
		);
	const chunks = await streamToBuffer(output);
	const file = await readFile('./test/audio/speech_orig.pcm');
	expect(roughlyEquals(file, chunks)).toEqual(true);
	done();
});
