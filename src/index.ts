import { createWriteStream, existsSync, mkdirSync } from 'fs';
import fetch from 'node-fetch';
import { join } from 'path';

import { pipeline } from 'stream';
import { promisify } from 'util';
const streamPipeline = promisify(pipeline);

import { dumpYaml, loadYaml } from './utils';

const command = process.argv[2];

const _cdn = 'https://unpkg.com';
const _loc = 'web_modules';

const paths = {
	pkg: join(process.cwd(), 'package.json'),
	upm: join(process.cwd(), 'upm.yml'),
	lock: join(process.cwd(), 'upm-lock.yml'),
};

const store: any = { pkg: false, upm: false, lock: false };

const download = async (cdn, loc, dep, ver, files?) => {
	const urls = files ? files : ['', 'package.json'].map(u => `${dep}@${ver}` + (u !== '' ? `/${u}` : ''));
	const queue = [];
	for (const url of urls) {
		queue.push(
			fetch(`${cdn}/${url}`).then(res => {
				const dest = res.url.replace(cdn, loc);
				store.lock[dep].resolved.push(dest.replace(loc + '/', ''));
				const target = dest.replace(`@${ver}/`, '/');
				const targetDirectory = target.substring(0, target.lastIndexOf('/'));
				mkdirSync(targetDirectory, { recursive: true });
				return streamPipeline(res.body, createWriteStream(target));
			}),
		);
	}
	return await Promise.all(queue);
};

const installWithoutStore = async (cdn, loc, deps) => {
	for (const dep of Object.keys(deps)) {
		const version = deps[dep].replace(/^\^|^\~|^\*/, '');
		if (!store.lock[dep]) {
			store.lock[dep] = { version, resolved: [] };
		}
		await download(cdn, loc, dep, version);
	}
};

const installWithStore = async (cdn, loc, deps) => {
	for (const dep of Object.keys(deps)) {
		await download(cdn, loc, dep, deps[dep].version, deps[dep].resolved);
	}
};

switch (command) {
	case 'init':
		let pkg = { dependencies: {} };
		if (existsSync(paths.pkg)) {
			// tslint:disable-next-line:no-var-requires
			pkg = require(paths.pkg);
		}
		const deps = pkg.dependencies;
		for (const dep of Object.keys(deps)) {
			deps[dep] = deps[dep].replace(/^\^|^\~|^\*/, '');
		}
		dumpYaml(paths.upm, { _cdn, _loc, deps });
		break;
	case 'update':
		break;
	default:
		const install = async () => {
			store.upm = loadYaml(paths.upm);
			store.lock = loadYaml(paths.lock);
			const hasLock = store.lock !== false;
			if (hasLock) {
				await installWithStore(store.upm._cdn, store.upm._loc, store.lock);
			} else {
				store.lock = {};
				await installWithoutStore(store.upm._cdn, store.upm._loc, store.upm.deps);
				dumpYaml(paths.lock, store.lock);
			}
		};
		install();
		break;
}
