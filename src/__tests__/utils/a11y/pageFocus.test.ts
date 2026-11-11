import { afterEach, describe, expect, it } from 'vitest';

import {
	focusPageStart,
	isFocusInPageContent,
	MAIN_CONTENT_ID,
} from '@/utils/a11y/pageFocus';

/**
 * Puts a page in the document: a link outside the content, then `<main>`.
 *
 * @param content - What `<main>` holds, as HTML.
 */
function showPage(content: string) {
	document.body.innerHTML = `
		<a href="/elsewhere">Outside</a>
		<main id="${MAIN_CONTENT_ID}">${content}</main>
	`;
}

afterEach(() => {
	document.body.innerHTML = '';
});

describe('focusPageStart', () => {
	it("focuses the page's heading, without making it a Tab stop", () => {
		showPage('<h1>Account</h1><a href="/x">A link</a>');

		focusPageStart();

		const heading = document.querySelector('h1');
		expect(heading).toHaveFocus();
		// -1: reachable from code only
		expect(heading).toHaveAttribute('tabindex', '-1');
	});

	it('focuses the content area when the page shows no heading yet', () => {
		showPage('<p>Loading…</p>');

		focusPageStart();

		expect(document.getElementById(MAIN_CONTENT_ID)).toHaveFocus();
	});

	it('does nothing, without failing, when there is no content area', () => {
		document.body.innerHTML = '<a href="/elsewhere">Outside</a>';

		expect(() => focusPageStart()).not.toThrow();
		expect(document.body).toHaveFocus();
	});
});

describe('isFocusInPageContent', () => {
	it('is true once focus is on the heading, false on a link outside', () => {
		showPage('<h1>Account</h1>');

		document.querySelector<HTMLElement>('a')!.focus();
		expect(isFocusInPageContent()).toBe(false);

		focusPageStart();
		expect(isFocusInPageContent()).toBe(true);
	});
});
