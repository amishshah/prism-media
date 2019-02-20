import { Transform } from 'stream';

export interface VolumeOptions {
  type: 's16le' | 's16be' | 's32le' | 's32be',
  volume?: number
}

export default class VolumeTransformer {
  public volume: number;

  constructor(options: VolumeOptions);
  public setVolume(volume: number): void;
  public setVolumeDecibels(db: number): void;
  public setVolumeLogarithmic(value: number): void;
  public readonly volumeDecibels: number;
  public readonly volumeLogarithmic: number;
}
