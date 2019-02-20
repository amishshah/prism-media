import { ChildProcess } from 'child_process';
import { Duplex } from 'stream';

export interface FFmpegOptions {
  args?: string[];
}

export default class FFmpegTransform extends Duplex {
  public process: ChildProcess;
  constructor(options?: FFmpegOptions);
}
