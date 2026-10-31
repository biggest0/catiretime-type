import { Button } from '@/components/ui/Button';
import { APP_VERSION } from '@/config/config';
import { useAppSettings } from '@/hooks/useAppSettings';

/**
 * Temporary Phase 0 page: proves the fonts and colour tokens load in both
 * themes. Its button switches the saved theme. Replaced by the real app
 * shell later in Phase 1.
 */
export default function App() {
	const { toggleDarkMode } = useAppSettings();

	return (
		<main className="mx-auto w-full max-w-[1280px] px-4 py-16">
			<h1 className="text-4xl text-section-label">Çatire Type</h1>
			<h2 className="mt-6 text-2xl text-foreground">A heading in Cardo</h2>
			<p className="mt-2">Body text in Tinos, the secondary text colour.</p>
			<p className="mt-2 text-sm text-muted-foreground">A muted caption.</p>
			<p className="mt-2 text-brand">The brand colour, used for links.</p>
			<Button onClick={toggleDarkMode} className="mt-6">
				Toggle dark mode
			</Button>
			<p className="mt-6 text-sm text-muted-foreground">{APP_VERSION}</p>
		</main>
	);
}
