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

const download = async (url, loc, dep, ver) => {
	const urls = ['', 'package.json'].map(u => `${url}/${dep}@${ver}` + (u !== '' ? `/${u}` : ''));
	const queue = [];
	for (const u of urls) {
		queue.push(
			fetch(u).then(res => {
				const dest = res.url.replace(url, loc);
				store.lock[dep][ver].push(dest.replace(loc, ''));
				const target = dest.replace(`@${ver}/`, '/');
				const targetDirectory = target.substring(0, target.lastIndexOf('/'));
				mkdirSync(targetDirectory, { recursive: true });
				return streamPipeline(res.body, createWriteStream(target));
			}),
		);
	}
	return await Promise.all(queue);
};

switch (command) {
	case 'init':
		let pkg = { dependencies: {} };
		if (existsSync(paths.pkg)) {
			// tslint:disable-next-line:no-var-requires
			pkg = require(paths.pkg);
		}
		const dependencies = pkg.dependencies;
		for (const dep of Object.keys(dependencies)) {
			dependencies[dep] = dependencies[dep].replace(/^\^|^\~|^\*/, '');
		}
		dumpYaml(paths.upm, { _cdn, _loc, dependencies });
		break;
	case 'update':
		break;
	default:
		const install = async () => {
			store.lock = loadYaml(paths.lock);
			const hasLock = store.lock !== false;
			if (!store.lock) {
				store.lock = {};
			}
			store.upm = loadYaml(paths.upm);
			const deps = store.upm.dependencies;
			for (const dep of Object.keys(deps)) {
				const version = deps[dep].replace(/^\^|^\~|^\*/, '');
				if (!store.lock[dep]) {
					store.lock[dep] = {};
				}
				if (!store.lock[dep][version]) {
					store.lock[dep][version] = [];
				}
				await download(store.upm._cdn, store.upm._loc, dep, version);
			}
			if (!hasLock) {
				console.log('TCL: install -> store.lock', store.lock);
				dumpYaml(paths.lock, store.lock);
			}
		};
		install();
		break;
}
