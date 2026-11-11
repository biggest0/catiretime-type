interface SectionHeaderProps {
	title: string;
	as?: 'h1' | 'h2';
}

/**
 * A page or section title in the app's heading style: capitals, in the
 * section-label colour.
 *
 * @param props.title - The translated title, in normal case; CSS shows it
 *   in capitals.
 * @param props.as - The heading level. `h2` (default) labels one section
 *   among several; `h1` when the section is the page, so every page has
 *   exactly one top-level heading.
 * @returns The heading.
 */
export function SectionHeader({
	title,
	as: Heading = 'h2',
}: SectionHeaderProps) {
	return (
		// text-section-label, not text-brand: brand means "interactive" in this
		// palette, so a title in that colour would look clickable.
		// uppercase: capitals are a look, so CSS applies them. The page keeps
		// the real text (search engines read "Account", not "ACCOUNT"), and
		// the browser follows the page language's casing rules.
		<Heading className="pb-4 text-section-label uppercase">{title}</Heading>
	);
}
