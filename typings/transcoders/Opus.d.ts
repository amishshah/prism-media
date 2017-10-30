import { Transform } from 'stream';

export interface OpusOptions {}

export class OpusStream extends Transform {
  public encoder: any; // TODO: type opusscript/node-opus

  constructor(options: OpusOptions);
  public static readonly type: 'opusscript' | 'node-opus';
  public setBitrate(bitrate: number): void;
  public setFEC(enabled: boolean): void;
  public setPLP(percentage: number): void;
}

export class Encoder extends OpusStream {}
export class Decoder extends OpusStream {}

export default { Encoder, Decoder }
