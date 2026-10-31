import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { APP_SETTING } from '@/constants/keys';
import {
	getAppSetting,
	setAppSetting,
} from '@/utils/storage/localStorageUtils';

/** What a first-time visitor gets. */
const DEFAULTS = { themeMode: 'system' };

beforeEach(() => {
	// the readers log what they recover from; keep the test output clean
	vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
	vi.restoreAllMocks();
	localStorage.clear();
});

describe('getAppSetting', () => {
	it('returns the defaults when nothing is saved', () => {
		expect(getAppSetting()).toEqual(DEFAULTS);
	});

	it.each(['light', 'dark', 'system'])('returns a saved %s theme', (mode) => {
		localStorage.setItem(APP_SETTING, JSON.stringify({ themeMode: mode }));

		expect(getAppSetting()).toEqual({ themeMode: mode });
	});

	it('returns the defaults when the saved data is corrupt', () => {
		localStorage.setItem(APP_SETTING, '{not json');

		expect(getAppSetting()).toEqual(DEFAULTS);
		expect(console.error).toHaveBeenCalled();
	});

	it.each(['5', '"dark"', 'null'])(
		'returns the defaults when the saved value %s is not an object',
		(raw) => {
			localStorage.setItem(APP_SETTING, raw);

			expect(getAppSetting()).toEqual(DEFAULTS);
		}
	);

	it.each([['purple'], [42], [null]])(
		'gives an invalid theme mode (%s) its default',
		(themeMode) => {
			localStorage.setItem(APP_SETTING, JSON.stringify({ themeMode }));

			expect(getAppSetting()).toEqual(DEFAULTS);
		}
	);

	it('drops keys it does not know', () => {
		localStorage.setItem(
			APP_SETTING,
			JSON.stringify({ themeMode: 'dark', homeLayout: { visible: {} } })
		);

		expect(getAppSetting()).toEqual({ themeMode: 'dark' });
	});

	it('returns the defaults when the browser blocks storage', () => {
		vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
			throw new DOMException('Access denied', 'SecurityError');
		});

		expect(getAppSetting()).toEqual(DEFAULTS);
	});

	it('returns a new object each time, so changing one leaves the next', () => {
		const first = getAppSetting();
		first.themeMode = 'dark';

		expect(getAppSetting()).toEqual(DEFAULTS);
	});
});

describe('setAppSetting', () => {
	it('saves under APP_SETTING, where getAppSetting reads it', () => {
		setAppSetting({ themeMode: 'dark' });

		expect(JSON.parse(localStorage.getItem(APP_SETTING)!)).toEqual({
			themeMode: 'dark',
		});
		expect(getAppSetting()).toEqual({ themeMode: 'dark' });
	});

	it('logs instead of throwing when storage is full', () => {
		vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
			throw new DOMException('Storage full', 'QuotaExceededError');
		});

		expect(() => setAppSetting({ themeMode: 'dark' })).not.toThrow();
		expect(console.error).toHaveBeenCalled();
	});
});
