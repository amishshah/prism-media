/* eslint-disable @typescript-eslint/no-require-imports */
import { OpusEncoder, OpusEncoderOptions } from './adapters/OpusEncoder';
import { DiscordJSOpusEncoder } from './adapters/@discordjs/opus';
import { OpusScriptEncoder } from './adapters/opusscript';

const LOADERS: [string, (options: OpusEncoderOptions) => OpusEncoder][] = [
	['@discordjs/opus', (options: OpusEncoderOptions) => new DiscordJSOpusEncoder(options)],
	['opusscript', (options: OpusEncoderOptions) => new OpusScriptEncoder(options)],
];

export function loadOpusLibrary() {
	const errorLog: string[] = [];

	for (const [modName, fn] of LOADERS) {
		try {
			require(modName);
			return fn;
		} catch (error: unknown) {
			errorLog.push(`- Load failure:\n  ${error instanceof Error ? error.message : 'unknown'}`);
		}
	}

	throw new Error(`Could not find an Opus engine:\n${errorLog.join('\n')}`);
}

let createOpusEncoder: (options: OpusEncoderOptions) => OpusEncoder = (options: OpusEncoderOptions) => {
	createOpusEncoder = loadOpusLibrary();
	return createOpusEncoder(options);
};

export { createOpusEncoder };
