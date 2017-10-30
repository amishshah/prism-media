import { Transform } from 'stream';

export interface VolumeOptions {}

export class VolumeTransformer {
  public volume: number;

  constructor(options: VolumeOptions, spec?: { bits: number, volume: number });
  public setVolume(volume: number): void;
  public setVolumeDecibels(db: number): void;
  public setVolumeLogarithmic(value: number): void;
  public readonly volumeDecibels: number;
  public readonly volumeLogarithmic: number;
}

export class VolumeTransformer16LE extends VolumeTransformer {}
export class VolumeTransformer16BE extends VolumeTransformer {}
export class VolumeTransformer32LE extends VolumeTransformer {}
export class VolumeTransformer32BE extends VolumeTransformer {}
