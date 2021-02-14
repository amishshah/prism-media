/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-var-requires */

import { spawnSync } from 'child_process';

interface FFmpegInfo {
	command: string;
	output: string;
	version: string;
}

let cached: FFmpegInfo | undefined = undefined;

const VERSION_REGEX = new RegExp(/version (.+) Copyright/im);

const SOURCES: (() => string)[] = [
	() => {
		const ffmpeg = require('ffmpeg-static');
		return ffmpeg?.path ?? ffmpeg;
	},
	() => 'ffmpeg',
	() => 'avconv',
	() => './ffmpeg',
	() => './avconv',
];

export function findFFmpeg(forceRefresh = false) {
	if (!forceRefresh && cached) {
		return cached;
	}

	const errorLog: string[] = [];

	for (const fn of SOURCES) {
		try {
			const command = fn();
			const result = spawnSync(command, ['-h'], { windowsHide: true, shell: true, encoding: 'utf-8' });
			if (result.error) throw result.error;
			if (result.stderr && !result.stdout) throw new Error(result.stderr);

			const output = result.output.filter(Boolean).join('\n');
			const version = VERSION_REGEX.exec(output)?.[1];
			if (!version) throw new Error(`Malformed FFmpeg command using ${command}`);

			cached = { command, output, version };
			return cached;
		} catch (error: unknown) {
			errorLog.push(`- Load failure:\n  ${error instanceof Error ? error.message : 'unknown'}`);
		}
	}

	throw new Error(`Could not find FFmpeg/avconv:\n${errorLog.join('\n')}`);
}
