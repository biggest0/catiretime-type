import { useTranslation } from 'react-i18next';
import { HiMoon, HiSun } from 'react-icons/hi';

import { useAppSettings } from '@/hooks/useAppSettings';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
	className?: string;
}

/**
 * The sun/moon button that switches between light and dark. The icon shows
 * the current theme; the label (read by screen readers, and the tooltip)
 * says what a click does. Clicking saves an explicit light or dark, so only
 * `ThemeSelector` can go back to System.
 *
 * @param props.className - Extra classes, merged last.
 * @returns The button.
 */
export function ThemeToggle({ className }: ThemeToggleProps) {
	const { t } = useTranslation();
	const { isDarkMode, toggleDarkMode } = useAppSettings();

	const switchLabel = t('THEME.SWITCH_TO', {
		mode: isDarkMode ? t('THEME.LIGHT') : t('THEME.DARK'),
	});

	return (
		<button
			type="button"
			onClick={toggleDarkMode}
			className={cn(
				'cursor-pointer transition-colors hover:text-foreground',
				className
			)}
			aria-label={switchLabel}
			title={switchLabel}
		>
			{isDarkMode ? (
				<HiMoon className="h-6 w-6" />
			) : (
				<HiSun className="h-6 w-6" />
			)}
		</button>
	);
}
