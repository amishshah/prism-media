declare module 'duplex-child-process' {
	import { SpawnOptionsWithoutStdio } from 'child_process';
	import { Duplex } from 'stream';

	export function spawn(command: string, args: string[], options: SpawnOptionsWithoutStdio): Duplex;
}
