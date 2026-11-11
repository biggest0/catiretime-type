import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { PageMeta } from '@/components/common/seo/PageMeta';
import i18n from '@/i18n/config';
// the real index.html, so the tests edit the tags the app actually ships
import indexHtml from '@/../index.html?raw';

// An app with a third language. The real list has two, which can't show
// whether a language's tag comes from the list or from an "English or
// French" test in the code.
vi.mock('@/i18n/languages', () => ({
	LANGUAGES: [
		{ code: 'en', name: 'English', ogLocale: 'en_CA' },
		{ code: 'fr', name: 'Français', ogLocale: 'fr_CA' },
		{ code: 'de', name: 'Deutsch', ogLocale: 'de_DE' },
	],
}));

const shippedHead = new DOMParser().parseFromString(indexHtml, 'text/html').head
	.innerHTML;

/**
 * Reads the link-preview language tags from the current `<head>`.
 *
 * @returns The page's own locale, and the alternates in page order.
 */
function localeTags() {
	const values = (selector: string) =>
		[...document.head.querySelectorAll(selector)].map((tag) =>
			tag.getAttribute('content')
		);
	return {
		locale: values('meta[property="og:locale"]'),
		alternates: values('meta[property="og:locale:alternate"]'),
	};
}

beforeEach(() => {
	document.head.innerHTML = shippedHead;
});

afterEach(async () => {
	await i18n.changeLanguage('en');
	localStorage.clear();
});

describe('PageMeta with three languages', () => {
	it('tags the page with its language and lists every other one', async () => {
		await i18n.changeLanguage('fr');
		render(
			<MemoryRouter>
				<PageMeta title="Compte" />
			</MemoryRouter>
		);

		expect(localeTags()).toEqual({
			locale: ['fr_CA'],
			alternates: ['en_CA', 'de_DE'],
		});
	});

	it('updates the tags when the language changes, without leftovers', async () => {
		await i18n.changeLanguage('fr');
		const { rerender } = render(
			<MemoryRouter>
				<PageMeta title="Compte" />
			</MemoryRouter>
		);

		await i18n.changeLanguage('en');
		rerender(
			<MemoryRouter>
				<PageMeta title="Account" />
			</MemoryRouter>
		);

		expect(localeTags()).toEqual({
			locale: ['en_CA'],
			alternates: ['fr_CA', 'de_DE'],
		});
	});
});
