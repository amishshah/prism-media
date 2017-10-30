import { Transform } from 'stream';

export default class WebmOpusTransform extends Transform {
  public offset: number;
  public length: number;
  public count: number;
  public skipUntil: number | null;
  public track: number | null;

  public readEBMLID(chunk: Buffer, offset?: number);
  public readTagDataSize(chunk: Buffer, offset?: number);
  public readTage(chunk: Buffer, offset?: number);
}
