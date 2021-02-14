import { TransformOptions } from 'stream';
import { WebmBaseDemuxer } from './WebmBaseDemuxer';

const VORBIS_HEAD = Buffer.from([...'vorbis'].map((x) => x.charCodeAt(0)));

export class WebmVorbisDemuxer extends WebmBaseDemuxer {
	public _checkHead(data: Buffer) {
		if (data.readUInt8(0) !== 2 || !data.slice(4, 10).equals(VORBIS_HEAD)) {
			throw Error('Audio codec is not Vorbis!');
		}

		this.push(data.slice(3, 3 + data.readUInt8(1)));
		this.push(data.slice(3 + data.readUInt8(1), 3 + data.readUInt8(1) + data.readUInt8(2)));
		this.push(data.slice(3 + data.readUInt8(1) + data.readUInt8(2)));
	}
}

export function createWebmVorbisDemuxer(options?: TransformOptions) {
	return new WebmVorbisDemuxer(options);
}
