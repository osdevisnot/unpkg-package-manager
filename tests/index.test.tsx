import { sum } from '../src';

describe('unpkg-package-manager', () => {
	test('exports', () => {
		expect(sum).toBeDefined();
		expect(typeof sum).toEqual('function');
	});
});
