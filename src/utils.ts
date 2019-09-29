import { readFileSync, writeFileSync } from 'fs';
import yaml from 'js-yaml';

export const loadYaml = (srcPath, exitOnFailure = false) => {
	try {
		return yaml.safeLoad(readFileSync(srcPath, 'utf-8'));
	} catch (e) {
		if (e && e.code !== 'ENOENT' && e.message) {
			console.error(e.message);
		}
		if (exitOnFailure) {
			process.exit(1);
		}
		return false;
	}
};

export const dumpYaml = (destPath, obj, exitOnFailure = true) => {
	try {
		return writeFileSync(destPath, yaml.safeDump(obj, { sortKeys: true }), 'utf-8');
	} catch (e) {
		if (e && e.message) {
			console.error(e.message);
		}
		if (exitOnFailure) {
			process.exit(1);
		}
		return false;
	}
};
