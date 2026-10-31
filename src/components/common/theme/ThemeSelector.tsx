import { useTranslation } from 'react-i18next';
import { HiDesktopComputer, HiMoon, HiSun } from 'react-icons/hi';

import { useAppSettings } from '@/hooks/useAppSettings';
import { cn } from '@/lib/utils';
import type { ThemeMode } from '@/types/localStorageTypes';

interface ThemeSelectorProps {
	className?: string;
}

// `as const` keeps the label keys as literals, which the typed t() requires
const THEMES = [
	{ mode: 'light', icon: HiSun, labelKey: 'THEME.LIGHT' },
	{ mode: 'dark', icon: HiMoon, labelKey: 'THEME.DARK' },
	{ mode: 'system', icon: HiDesktopComputer, labelKey: 'THEME.SYSTEM' },
] as const satisfies readonly {
	mode: ThemeMode;
	icon: typeof HiSun;
	labelKey: string;
}[];

/**
 * Light, Dark and System as three buttons, the current one pressed
 * (`aria-pressed`). System follows the device's setting; this is the only
 * control that can choose it again after `ThemeToggle` has been used. On
 * small screens only the icons show; the labels stay for screen readers.
 *
 * @param props.className - Extra classes for the group, merged last.
 * @returns The three buttons.
 */
export function ThemeSelector({ className }: ThemeSelectorProps) {
	const { t } = useTranslation();
	const { appSetting, setThemeMode } = useAppSettings();

	return (
		<div
			className={cn(
				'flex items-center gap-1 rounded-lg bg-muted p-1',
				className
			)}
		>
			{THEMES.map(({ mode, icon: Icon, labelKey }) => {
				const selected = appSetting.themeMode === mode;
				return (
					<button
						key={mode}
						type="button"
						onClick={() => setThemeMode(mode)}
						className={cn(
							'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-200 ease-in-out focus:ring-2 focus:ring-brand focus:outline-none',
							selected
								? 'bg-control-active text-foreground shadow-sm'
								: 'text-muted-foreground hover:text-foreground'
						)}
						aria-label={t('THEME.SWITCH_TO', { mode: t(labelKey) })}
						aria-pressed={selected}
					>
						<Icon className="h-4 w-4" />
						<span className="hidden sm:inline">{t(labelKey)}</span>
					</button>
				);
			})}
		</div>
	);
}
