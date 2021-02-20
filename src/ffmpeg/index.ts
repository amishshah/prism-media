import { SpawnOptionsWithoutStdio } from 'child_process';
import { spawn } from 'duplex-child-process';
import { Duplex } from 'stream';
import { findFFmpeg } from './loader';

export function createFFmpeg(args: string[], options?: SpawnOptionsWithoutStdio, forceRefresh = false): Duplex {
	return spawn(findFFmpeg(forceRefresh).command, [...args, 'pipe:1'], {
		shell: true,
		windowsHide: true,
		...options,
	});
}

export { findFFmpeg };
