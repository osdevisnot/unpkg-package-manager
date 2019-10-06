import { readFileSync, writeFileSync } from 'fs';

import yaml from 'js-yaml';

const handleFsError = (e, exitOnFailure) => {
	if (e && e.code !== 'ENOENT' && e.message) console.error(e.message);
	if (exitOnFailure) process.exit(1);
	return false;
};

export const loadYaml = (srcPath, exitOnFailure = false) => {
	try {
		return yaml.safeLoad(readFileSync(srcPath, 'utf-8'));
	} catch (e) {
		return handleFsError(e, exitOnFailure);
	}
};

export const dumpYaml = (destPath, obj, exitOnFailure = true) => {
	try {
		return writeFileSync(destPath, yaml.safeDump(obj, { sortKeys: true }), 'utf-8');
	} catch (e) {
		return handleFsError(e, exitOnFailure);
	}
};
