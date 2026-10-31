import { describe, expect, it } from 'vitest';

import { SITE_URL } from '@/config/config';
import { absoluteUrl, canonicalPath } from '@/utils/seo/urlUtils';

describe('canonicalPath', () => {
	it('keeps the home page as a bare slash', () => {
		expect(canonicalPath('/')).toBe('/');
		expect(canonicalPath('')).toBe('/');
	});

	it('adds exactly one trailing slash', () => {
		expect(canonicalPath('/about')).toBe('/about/');
		expect(canonicalPath('/about/')).toBe('/about/');
		expect(canonicalPath('/about//')).toBe('/about/');
	});

	it('adds a missing leading slash', () => {
		expect(canonicalPath('about')).toBe('/about/');
	});

	it('drops query strings and hashes', () => {
		expect(canonicalPath('/search?q=cats&sortBy=newest')).toBe('/search/');
		expect(canonicalPath('/about#mission')).toBe('/about/');
	});

	it('preserves encoded segments', () => {
		expect(canonicalPath('/subcategory/space%20travel')).toBe(
			'/subcategory/space%20travel/'
		);
		expect(canonicalPath('/article/0ca44d28-1e3a')).toBe(
			'/article/0ca44d28-1e3a/'
		);
	});
});

describe('absoluteUrl', () => {
	it("prefixes the site's origin", () => {
		expect(absoluteUrl('/about')).toBe(`${SITE_URL}/about/`);
		expect(absoluteUrl('/')).toBe(`${SITE_URL}/`);
	});
});
