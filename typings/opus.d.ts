import { Transform } from 'stream';
import { Opus } from '@typescord/opus';
import { OpusEncoder } from '@discordjs/opus';
import OpusScript from 'opusscript';

interface OpusOptions {
  frameSize: number;
  channels: number;
  rate: number;
}

export class OpusStream extends Transform {
  public encoder: Opus | OpusEncoder | OpusScript;

  public constructor(options?: OpusOptions);
  public static readonly type: '@typescord/opus' | '@discordjs/opus' | 'opusscript';
  public setBitrate(bitrate: number): void;
  public setFEC(enabled: boolean): void;
  public setPLP(percentage: number): void;
}

export namespace opus {
  interface OpusOptions {
    frameSize: number;
    channels: number;
    rate: number;
  }

  export class Encoder extends OpusStream {}
  export class Decoder extends OpusStream {}
  export class OggDemuxer extends Transform {}
  export class WebmDemuxer extends Transform {}
}
