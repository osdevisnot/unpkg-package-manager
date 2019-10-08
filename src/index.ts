import { existsSync } from 'fs';
import { join } from 'path';

import { cdn, loc, SEMVER_REGEX } from './constants';
import { download } from './download';
import { error } from './logs';
import { dumpYaml, loadYaml } from './yaml';

import ora from 'ora';

const command = process.argv[2];

const paths = {
	pkg: join(process.cwd(), 'package.json'),
	upm: join(process.cwd(), 'upm.yml'),
	lock: join(process.cwd(), 'upm-lock.yml'),
};

const store: any = { pkg: false, upm: false, lock: false };

const installWithoutLock = async (cdn, loc, deps) => {
	for (const dep of Object.keys(deps)) {
		const version = deps[dep].replace(SEMVER_REGEX, '');
		if (!store.lock[dep]) {
			store.lock[dep] = { version, resolved: [] };
		}
		const files = ['', 'package.json'].map(f => `${dep}@${version}` + (f !== '' ? `/${f}` : ''));
		await download(cdn, loc, dep, version, files, store.lock);
	}
};

const installWithLock = async (cdn, loc, deps) => {
	for (const dep of Object.keys(deps)) {
		await download(cdn, loc, dep, deps[dep].version, deps[dep].resolved);
	}
};

switch (command) {
	case 'init':
		let pkg = { dependencies: {} };
		if (existsSync(paths.pkg)) {
			// tslint:disable-next-line:no-var-requires
			pkg = { ...pkg, ...require(paths.pkg) };
		}
		const deps = pkg.dependencies;
		for (const dep of Object.keys(deps)) {
			deps[dep] = deps[dep].replace(SEMVER_REGEX, '');
		}
		dumpYaml(paths.upm, { cdn, loc, deps });
		break;
	case 'update':
		break;
	default:
		const install = async () => {
			store.upm = { cdn, loc, ...loadYaml(paths.upm) };
			store.lock = loadYaml(paths.lock);
			const hasUpm = store.upm !== false;
			const hasLock = store.lock !== false;
			if (!hasUpm) {
				error('`upm.yml` not found. Try `upm init` to initialize the repo !!');
				process.exit(1);
			}
			const spinner = ora('Installing Dependencies...').start();
			try {
				if (hasLock) {
					await installWithLock(store.upm.cdn, store.upm.loc, store.lock);
				} else {
					store.lock = {};
					await installWithoutLock(store.upm.cdn, store.upm.loc, store.upm.deps);
					dumpYaml(paths.lock, store.lock);
				}
				spinner.succeed();
			} catch (e) {
				spinner.fail();
				console.trace(e.message);
			}
		};
		install();
		break;
}
