import { createWriteStream, mkdirSync } from 'fs';
import fetch from 'node-fetch';
import { pipeline } from 'stream';
import { promisify } from 'util';

const streamPipeline = promisify(pipeline);

export const download = async (cdn, loc, dep, ver, urls, lock = false) => {
	const queue = [];
	for (const url of urls) {
		queue.push(
			fetch(`${cdn}/${url}`).then(res => {
				const dest = res.url.replace(cdn, loc);
				if (lock) lock[dep].resolved.push(dest.replace(loc + '/', ''));
				const target = dest.replace(`@${ver}/`, '/');
				const targetDirectory = target.substring(0, target.lastIndexOf('/'));
				mkdirSync(targetDirectory, { recursive: true });
				return streamPipeline(res.body, createWriteStream(target));
			}),
		);
	}
	return await Promise.all(queue);
};
