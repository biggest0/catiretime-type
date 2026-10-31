import { describe, expect, it } from 'vitest';

import enCommon from '@/i18n/en/common.json';
import frCommon from '@/i18n/fr/common.json';

/** One translation: its dotted key path and its value. */
// eg. ['COMMON.CLOSE', 'Close']
type Entry = [path: string, value: unknown];

/**
 * Lists every translation in a language file, walking into nested groups.
 *
 * @param obj - A translation file, or a group inside one.
 * @param prefix - The dotted path of `obj` itself; empty for a whole file.
 * @returns One entry per translation, e.g. `['COMMON.CLOSE', 'Close']`.
 */
function leafEntries(obj: Record<string, unknown>, prefix = ''): Entry[] {
	return Object.entries(obj).flatMap(([key, value]): Entry[] => {
		const path = prefix ? `${prefix}.${key}` : key;

		// a group such as COMMON: list the translations inside it, under its path
		if (typeof value === 'object' && value !== null) {
			return leafEntries(value as Record<string, unknown>, path);
		}

		return [[path, value]];
	});
}

/**
 * Finds the key paths one language has and the other doesn't.
 *
 * @param paths - Key paths of the language being checked.
 * @param otherPaths - Key paths of the language it's compared with.
 * @returns The paths missing from `otherPaths`; empty when none are.
 */
function missingFrom(paths: string[], otherPaths: string[]): string[] {
	return paths.filter((path) => !otherPaths.includes(path));
}

/**
 * Finds the translations with no text: empty, only spaces, or not a string.
 *
 * @param entries - The translations of one language.
 * @returns The key paths of the blank ones; empty when none are.
 */
function blankPaths(entries: Entry[]): string[] {
	return entries
		.filter(([, value]) => typeof value !== 'string' || value.trim() === '')
		.map(([path]) => path);
}

describe('i18n key parity', () => {
	const en = leafEntries(enCommon);
	const fr = leafEntries(frCommon);
	const enPaths = en.map(([path]) => path);
	const frPaths = fr.map(([path]) => path);

	it('has every English key in French', () => {
		expect(missingFrom(enPaths, frPaths)).toEqual([]);
	});

	it('has every French key in English', () => {
		expect(missingFrom(frPaths, enPaths)).toEqual([]);
	});

	it('has no empty translations', () => {
		// by language, so a failure says which file the blank value is in
		expect({ en: blankPaths(en), fr: blankPaths(fr) }).toEqual({
			en: [],
			fr: [],
		});
	});
});
