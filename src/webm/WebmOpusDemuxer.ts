import { TransformOptions } from 'stream';
import { WebmBaseDemuxer } from './WebmBaseDemuxer';

const OPUS_HEAD = Buffer.from([...'OpusHead'].map((x) => x.charCodeAt(0)));

export class WebmOpusDemuxer extends WebmBaseDemuxer {
	public _checkHead(data: Buffer) {
		if (!data.slice(0, 8).equals(OPUS_HEAD)) {
			throw Error('Audio codec is not Opus!');
		}
	}
}

export function createWebmOpusDemuxer(options?: TransformOptions) {
	return new WebmOpusDemuxer(options);
}
