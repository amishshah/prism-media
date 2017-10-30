import { Transform } from 'stream';

export default class OggOpusTransform extends Transform{
  public readPage(chunk: Buffer): boolean | Buffer;
}
