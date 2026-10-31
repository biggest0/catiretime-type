import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { PageMeta } from '@/components/common/seo/PageMeta';
import { SITE_URL } from '@/config/config';
import { SITE_NAME } from '@/constants/site';
import en from '@/i18n/en/common.json';
import fr from '@/i18n/fr/common.json';
import i18n from '@/i18n/config';
// the real index.html, so the tests edit the tags the app actually ships
import indexHtml from '@/../index.html?raw';

const shippedHead = new DOMParser().parseFromString(indexHtml, 'text/html').head
	.innerHTML;

/**
 * Reads a tag's value from the current `<head>`.
 *
 * @param selector - CSS selector for the tag.
 * @param attr - The attribute to read (`content` for `<meta>`).
 * @returns The value, or `null` when the tag is missing.
 */
function headValue(selector: string, attr = 'content') {
	return document.head.querySelector(selector)?.getAttribute(attr) ?? null;
}

/**
 * Renders a page's `PageMeta` at an address, as the router would.
 *
 * @param ui - The `<PageMeta …/>` element.
 * @param url - The current address.
 * @returns RTL's render result.
 */
function renderAt(ui: ReactElement, url = '/') {
	return render(<MemoryRouter initialEntries={[url]}>{ui}</MemoryRouter>);
}

beforeEach(() => {
	document.head.innerHTML = shippedHead;
	document.title = document.head.querySelector('title')?.textContent ?? '';
});

afterEach(async () => {
	await i18n.changeLanguage('en');
	localStorage.clear();
});

describe('PageMeta', () => {
	it("edits index.html's tags instead of adding second copies", () => {
		renderAt(<PageMeta title="Account" />);

		expect(document.title).toBe(`Account | ${SITE_NAME}`);
		for (const selector of [
			'title',
			'meta[name="description"]',
			'meta[name="robots"]',
			'link[rel="canonical"]',
			'meta[property="og:title"]',
			'meta[property="og:url"]',
		]) {
			expect(document.head.querySelectorAll(selector)).toHaveLength(1);
		}
		expect(headValue('meta[property="og:title"]')).toBe(
			`Account | ${SITE_NAME}`
		);
	});

	it("uses the page's description, or the home page's", () => {
		const { rerender } = renderAt(
			<PageMeta title="Account" description="Your account." />
		);
		expect(headValue('meta[name="description"]')).toBe('Your account.');

		rerender(
			<MemoryRouter>
				<PageMeta title="Account" />
			</MemoryRouter>
		);
		expect(headValue('meta[name="description"]')).toBe(en.SEO.HOME.DESCRIPTION);
	});

	it('keeps noindex pages out of search results', () => {
		renderAt(<PageMeta title="Sign in" noindex />);
		expect(headValue('meta[name="robots"]')).toBe('noindex, follow');
	});

	it('lets other pages be indexed', () => {
		renderAt(<PageMeta title="Home" />);
		expect(headValue('meta[name="robots"]')).toBe(
			'index, follow, max-image-preview:large'
		);
	});

	it('builds the canonical URL from the address, without query or hash', () => {
		renderAt(<PageMeta title="Account" />, '/account?tab=stats#top');

		expect(headValue('link[rel="canonical"]', 'href')).toBe(
			`${SITE_URL}/account/`
		);
		expect(headValue('meta[property="og:url"]')).toBe(`${SITE_URL}/account/`);
	});

	it('follows the UI language', async () => {
		await i18n.changeLanguage('fr');
		renderAt(<PageMeta title="Compte" />);

		expect(headValue('meta[property="og:locale"]')).toBe('fr_CA');
		expect(headValue('meta[property="og:locale:alternate"]')).toBe('en_CA');
		expect(headValue('meta[name="description"]')).toBe(fr.SEO.HOME.DESCRIPTION);
	});

	it('ships the same default description in index.html as SEO.HOME.DESCRIPTION', () => {
		// index.html can't read the translations, so it holds a copy
		expect(headValue('meta[name="description"]')).toBe(en.SEO.HOME.DESCRIPTION);
	});
});
