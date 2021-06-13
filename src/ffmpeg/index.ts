import { SpawnOptionsWithoutStdio } from 'child_process';
import DuplexChildProcess from 'duplex-child-process';
import { DuplexOptions } from 'stream';
import { findFFmpeg } from './loader';

export interface FFmpegOptions extends DuplexOptions, SpawnOptionsWithoutStdio {
	args: string[];
	forceRefresh?: boolean;
}

export class FFmpeg extends DuplexChildProcess {
	public constructor(options: FFmpegOptions) {
		super(options);
		this.spawn(findFFmpeg(options.forceRefresh).command, [...options.args, 'pipe:1'], {
			shell: true,
			windowsHide: true,
			...options,
		});
	}
}

export { findFFmpeg };
