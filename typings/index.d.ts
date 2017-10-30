import OpusTranscoder from './transcoders/Opus';
import FFmpegTranscoder from './transcoders/FFmpeg';
import OggOpusDemuxer from './demuxers/OggOpus';
import WebmOpusDemuxer from './demuxers/WebmOpus';
import {
  VolumeTransformer16LE,
  VolumeTransformer16BE,
  VolumeTransformer32LE,
  VolumeTransformer32BE,
} from './transformers/PCMVolume';

export = {
  opus: OpusTranscoder,
  FFmpeg: FFmpegTranscoder,
  OggOpusDemuxer,
  WebmOpusDemuxer,
  VolumeTransformer16LE,
  VolumeTransformer16BE,
  VolumeTransformer32LE,
  VolumeTransformer32BE,
}
