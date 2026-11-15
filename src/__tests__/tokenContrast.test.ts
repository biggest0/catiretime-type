import { describe, expect, it } from 'vitest';

import stylesheet from '@/index.css?raw';

// Colours are chosen once, in index.css, and used everywhere through their
// tokens. This test reads the values from the stylesheet and checks each
// pair below against WCAG's contrast minimums, in both themes, so a token
// edited later can't quietly become too faint to read. It checks the pairs
// listed here, not every combination a component could make: add a pair
// when a token gets a new job.
//
// Not listed on purpose: white text on the amber button fill
// (primary-foreground on primary). It's below 4.5:1, and the owner kept
// Çatire's colours there.

/** WCAG 1.4.3: text, including an input's placeholder. */
const TEXT = 4.5;
/** WCAG 1.4.11: a shape needed to see a control, such as an input's border. */
const SHAPE = 3;

/** What each token is drawn on, and the contrast that pairing needs. */
const PAIRS = [
	// text on the page and on raised surfaces (cards, inputs)
	...[
		'foreground',
		'foreground-secondary',
		'muted-foreground',
		'section-label',
		'brand',
		'placeholder',
		'success',
		'destructive',
		'warning',
	].flatMap((token) => [
		{ token, on: 'background', min: TEXT },
		{ token, on: 'card', min: TEXT },
	]),
	// body text on the neutral surface (hovered rows, ThemeSelector's group)
	{ token: 'foreground-secondary', on: 'muted', min: TEXT },
	// each surface's own text colour
	{ token: 'card-foreground', on: 'card', min: TEXT },
	{ token: 'popover-foreground', on: 'popover', min: TEXT },
	{ token: 'secondary-foreground', on: 'secondary', min: TEXT },
	{ token: 'accent-foreground', on: 'accent', min: TEXT },
	// outlines that show where a control is
	{ token: 'input', on: 'background', min: SHAPE },
	{ token: 'input', on: 'card', min: SHAPE },
	{ token: 'ring', on: 'background', min: SHAPE },
];

/**
 * Reads the custom properties declared in one block of the stylesheet.
 *
 * @param selector - The block's selector: `:root` or `.dark`.
 * @returns Each property's value by name, without the `--`, e.g.
 *   `{ background: '#ffffff', … }`.
 */
function readBlock(selector: string): Record<string, string> {
	// from the selector at the start of a line to the closing brace that
	// starts a line
	const start = stylesheet.indexOf(`\n${selector} {`);
	const block = stylesheet.slice(start, stylesheet.indexOf('\n}', start));

	const values: Record<string, string> = {};
	for (const [, name, value] of block.matchAll(/--([\w-]+):\s*([^;]+);/g)) {
		values[name] = value.trim();
	}
	return values;
}

/** The light theme's tokens, and the dark theme's laid over them. */
const THEMES = {
	light: readBlock(':root'),
	dark: { ...readBlock(':root'), ...readBlock('.dark') },
};

/**
 * How bright a colour is, from 0 (black) to 1 (white): WCAG's "relative
 * luminance".
 *
 * @param hex - A colour as `#rrggbb`.
 * @returns Its luminance.
 */
function luminance(hex: string): number {
	const [red, green, blue] = [1, 3, 5].map((start) => {
		const channel = parseInt(hex.slice(start, start + 2), 16) / 255;
		return channel <= 0.04045
			? channel / 12.92
			: ((channel + 0.055) / 1.055) ** 2.4;
	});
	return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

/**
 * WCAG's contrast ratio between two colours, from 1 (the same) to 21.
 *
 * @param first - One colour, as `#rrggbb`.
 * @param second - The other.
 * @returns The ratio, e.g. `4.83` for gray-500 on white.
 */
function contrast(first: string, second: string): number {
	const [lighter, darker] = [luminance(first), luminance(second)].sort(
		(a, b) => b - a
	);
	return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Checks every pair in one theme.
 *
 * @param tokens - The theme's tokens by name.
 * @returns `tooFaint`: the pairs under their minimum, as readable lines;
 *   `notPlain`: the pairs that can't be computed because a value isn't a
 *   plain `#rrggbb` colour (a translucent one depends on what's behind it).
 */
function checkPairs(tokens: Record<string, string>) {
	const isPlain = (value: string) => /^#[0-9a-f]{6}$/i.test(value);
	const tooFaint: string[] = [];
	const notPlain: string[] = [];

	for (const { token, on, min } of PAIRS) {
		const [colour, surface] = [tokens[token], tokens[on]];
		if (!isPlain(colour) || !isPlain(surface)) {
			notPlain.push(`${token} on ${on}`);
			continue;
		}

		const ratio = contrast(colour, surface);
		if (ratio < min) {
			tooFaint.push(
				`${token} (${colour}) on ${on} (${surface}): ${ratio.toFixed(2)}, needs ${min}`
			);
		}
	}
	return { tooFaint, notPlain };
}

describe('colour tokens', () => {
	it('reads the tokens of both themes from index.css', () => {
		// a wrong pattern would read nothing and let anything pass
		expect(THEMES.light.background).toMatch(/^#[0-9a-f]{6}$/i);
		expect(THEMES.dark.background).toMatch(/^#[0-9a-f]{6}$/i);
		expect(THEMES.dark.background).not.toBe(THEMES.light.background);
	});

	it('are readable on their surfaces in the light theme', () => {
		const { tooFaint, notPlain } = checkPairs(THEMES.light);

		expect(tooFaint).toEqual([]);
		expect(notPlain).toEqual([]);
	});

	it('are readable on their surfaces in the dark theme', () => {
		const { tooFaint, notPlain } = checkPairs(THEMES.dark);

		expect(tooFaint).toEqual([]);
		// the dark hover tint is translucent: what shows depends on the
		// surface under it, so this pair is checked by eye, not here
		expect(notPlain).toEqual(['accent-foreground on accent']);
	});
});
