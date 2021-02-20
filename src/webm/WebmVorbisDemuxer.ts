import { TransformOptions } from 'stream';
import { WebmBaseDemuxer } from './WebmBaseDemuxer';

const VORBIS_HEAD = Buffer.from([...'vorbis'].map((x) => x.charCodeAt(0)));

export class WebmVorbisDemuxer extends WebmBaseDemuxer {
	protected _checkHead(data: Buffer) {
		if (data.readUInt8(0) !== 2 || data.compare(VORBIS_HEAD, 0, 6, 4, 10) !== 0) {
			throw Error('Audio codec is not Vorbis!');
		}

		const b1 = data.readUInt8(1);
		const b2 = data.readUInt8(2);

		this.push(data.slice(3, 3 + b1));
		this.push(data.slice(3 + b1, 3 + b1 + b2));
		this.push(data.slice(3 + b1 + b2));
	}
}

export function createWebmVorbisDemuxer(options?: TransformOptions) {
	return new WebmVorbisDemuxer(options);
}
