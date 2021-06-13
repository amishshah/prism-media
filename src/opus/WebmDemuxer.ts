import { WebmBaseDemuxer } from '../webm/WebmBaseDemuxer';

const OPUS_HEAD = Buffer.from('OpusHead');

export class WebmDemuxer extends WebmBaseDemuxer {
	protected _checkHead(data: Buffer) {
		if (data.compare(OPUS_HEAD, 0, 8, 0, 8) !== 0) {
			throw Error('Audio codec is not Opus!');
		}
	}
}
