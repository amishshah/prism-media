/* eslint-disable @typescript-eslint/no-require-imports */
import { OpusEncoder, OpusEncoderOptions } from './adapters/OpusEncoder';
import { DiscordJSOpusEncoder } from './adapters/@discordjs-opus';
import { EvanOpusEncoder } from './adapters/@evan-opus';
import { OpusScriptEncoder } from './adapters/opusscript';

const LOADERS: [string, (options: OpusEncoderOptions) => OpusEncoder][] = [
	['@discordjs/opus', (options: OpusEncoderOptions) => new DiscordJSOpusEncoder(options)],
	['@evan/opus', (options: OpusEncoderOptions) => new EvanOpusEncoder(options)],
	['opusscript', (options: OpusEncoderOptions) => new OpusScriptEncoder(options)],
];

let cached: ((options: OpusEncoderOptions) => OpusEncoder) | undefined;

export function loadOpusLibrary(
	extraLoaders: typeof LOADERS = [],
	forceRefresh = false,
): (options: OpusEncoderOptions) => OpusEncoder {
	if (!forceRefresh && cached) {
		return cached;
	}

	const errorLog: string[] = [];

	for (const [modName, fn] of extraLoaders.concat(LOADERS)) {
		try {
			require(modName);
			return (cached = fn);
		} catch (error: unknown) {
			errorLog.push(`- Load failure ${modName}:\n  ${((error as any)?.message as string | undefined) ?? 'unknown'}`);
		}
	}

	throw new Error(`Could not find an Opus engine:\n${errorLog.join('\n')}`);
}

export function createOpusEncoder(
	options: OpusEncoderOptions,
	extraLoaders?: typeof LOADERS,
	forceRefresh?: boolean,
): OpusEncoder {
	return loadOpusLibrary(extraLoaders, forceRefresh)(options);
}
