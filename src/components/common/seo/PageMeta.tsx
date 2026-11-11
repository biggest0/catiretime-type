import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

import { SITE_NAME } from '@/constants/site';
import { LANGUAGES } from '@/i18n/languages';
import { absoluteUrl } from '@/utils/seo/urlUtils';

interface PageMetaProps {
	title: string;
	description?: string;
	path?: string;
	noindex?: boolean;
}

const ROBOTS_INDEX = 'index, follow, max-image-preview:large';
const ROBOTS_NOINDEX = 'noindex, follow';

/**
 * Sets a `<meta>` tag's content, editing the existing tag so there's only
 * ever one per key, and creating it if `index.html` doesn't ship it.
 *
 * @param attr - The attribute that names the tag: `name` or `property`.
 * @param key - Its value, e.g. `description` or `og:title`.
 * @param content - The new content.
 */
function setMetaTag(attr: 'name' | 'property', key: string, content: string) {
	let tag = document.head.querySelector<HTMLMetaElement>(
		`meta[${attr}="${key}"]`
	);
	if (!tag) {
		tag = document.createElement('meta');
		tag.setAttribute(attr, key);
		document.head.appendChild(tag);
	}
	tag.setAttribute('content', content);
}

/**
 * Sets the group of `<meta>` tags that share one `property`, one tag per
 * value: fills the tags that exist, adds the missing ones and removes any
 * left over.
 *
 * @param property - The property every tag has, e.g. `og:locale:alternate`.
 * @param contents - The values, one per tag, in order.
 */
function setMetaTagGroup(property: string, contents: readonly string[]) {
	const tags = [
		...document.head.querySelectorAll<HTMLMetaElement>(
			`meta[property="${property}"]`
		),
	];

	contents.forEach((content, index) => {
		let tag = tags[index];
		if (!tag) {
			tag = document.createElement('meta');
			tag.setAttribute('property', property);
			document.head.appendChild(tag);
		}
		tag.setAttribute('content', content);
	});
	tags.slice(contents.length).forEach((tag) => tag.remove());
}

/**
 * Sets a `<link>` tag's address, editing the existing tag or creating it.
 *
 * @param rel - Its `rel`, e.g. `canonical`.
 * @param href - The new address.
 */
function setLinkTag(rel: string, href: string) {
	let tag = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
	if (!tag) {
		tag = document.createElement('link');
		tag.setAttribute('rel', rel);
		document.head.appendChild(tag);
	}
	tag.setAttribute('href', href);
}

/**
 * Sets the page's title, description, robots directive, canonical URL and
 * share tags (Open Graph, X). Every page renders one: the site is a single
 * HTML file, so without it every page would keep the home page's tags.
 *
 * It edits the tags `index.html` ships instead of rendering `<title>` and
 * `<meta>`: React 19 would add second copies (a second title, and a second
 * description placed after the site default, which then comes first).
 *
 * @param props.title - The page's own title; `| Çatire Type` is added.
 * @param props.description - The page's description. Defaults to the home
 *   page's (`SEO.HOME.DESCRIPTION`), so a page never keeps the previous
 *   page's.
 * @param props.path - The path for the canonical URL. Defaults to the
 *   current one; the query and hash are always dropped.
 * @param props.noindex - Keep the page out of search results (account and
 *   sign-in pages, typing runs, not found), while its links are still
 *   followed.
 * @returns Nothing visible.
 */
export function PageMeta({
	title,
	description,
	path,
	noindex = false,
}: PageMetaProps) {
	const { t, i18n } = useTranslation();
	const location = useLocation();

	const fullTitle = `${title} | ${SITE_NAME}`;
	const metaDescription = description ?? t('SEO.HOME.DESCRIPTION');
	const canonical = absoluteUrl(path ?? location.pathname);
	// the UI language's entry in the list (the first, if i18n hasn't settled
	// on one of them)
	const { ogLocale } =
		LANGUAGES.find(({ code }) => code === i18n.resolvedLanguage) ??
		LANGUAGES[0];

	useEffect(() => {
		// edits index.html's <title> rather than adding a second one
		document.title = fullTitle;
		setMetaTag('name', 'description', metaDescription);
		setMetaTag('name', 'robots', noindex ? ROBOTS_NOINDEX : ROBOTS_INDEX);
		setLinkTag('canonical', canonical);

		// Open Graph
		setMetaTag('property', 'og:title', fullTitle);
		setMetaTag('property', 'og:description', metaDescription);
		setMetaTag('property', 'og:url', canonical);
		// the page's language, then one "also available in" tag for each
		// other language in the list
		setMetaTag('property', 'og:locale', ogLocale);
		setMetaTagGroup(
			'og:locale:alternate',
			LANGUAGES.map((language) => language.ogLocale).filter(
				(locale) => locale !== ogLocale
			)
		);

		// X cards (the card type is static in index.html)
		setMetaTag('name', 'twitter:title', fullTitle);
		setMetaTag('name', 'twitter:description', metaDescription);
	}, [fullTitle, metaDescription, canonical, ogLocale, noindex]);

	return null;
}
