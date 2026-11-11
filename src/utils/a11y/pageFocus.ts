/** The `id` of the page's `<main>`: where the skip link's address points. */
export const MAIN_CONTENT_ID = 'main-content';

/**
 * Moves keyboard focus to the start of the page's content: its heading (the
 * one `h1` every page has), or `<main>` itself while a page shows none. A
 * screen reader then reads the heading, so the visitor hears which page
 * they're on, and the next Tab goes into the content.
 *
 * The page isn't scrolled: after a link `ScrollToTop` has done that, and
 * after Back the browser puts the page back where it was.
 */
export function focusPageStart(): void {
	const main = document.getElementById(MAIN_CONTENT_ID);
	if (!main) return;

	const target = main.querySelector<HTMLElement>('h1') ?? main;
	// -1: focusable from code, without becoming a Tab stop. Set here rather
	// than on every page's heading, so a new page needs nothing special.
	target.setAttribute('tabindex', '-1');
	target.focus({ preventScroll: true });
}

/**
 * Tells whether keyboard focus is inside the page's content (its `<main>`).
 * A panel that closes because of a navigation uses it to leave focus where
 * `focusPageStart()` just put it, instead of taking it back.
 *
 * @returns `true` when the focused element is `<main>` or inside it.
 */
export function isFocusInPageContent(): boolean {
	const main = document.getElementById(MAIN_CONTENT_ID);
	return main !== null && main.contains(document.activeElement);
}
