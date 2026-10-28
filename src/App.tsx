/**
 * Temporary Phase 0 page: proves the fonts and colour tokens load in both
 * themes. Replaced by the real app shell in Phase 1.
 */
export default function App() {
	return (
		<main className="mx-auto w-full max-w-[1280px] px-4 py-16">
			<h1 className="text-4xl text-section-label">Çatire Type</h1>
			<h2 className="mt-6 text-2xl text-foreground">A heading in Cardo</h2>
			<p className="mt-2">Body text in Tinos, the secondary text colour.</p>
			<p className="mt-2 text-sm text-muted-foreground">A muted caption.</p>
			<p className="mt-2 text-brand">The brand colour, used for links.</p>
			<button
				type="button"
				onClick={() => document.documentElement.classList.toggle("dark")}
				className="mt-6 rounded-lg bg-primary px-4 py-2 text-primary-foreground transition-colors hover:bg-primary-hover"
			>
				Toggle dark mode
			</button>
		</main>
	);
}
