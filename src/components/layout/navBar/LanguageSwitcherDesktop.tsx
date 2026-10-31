import { useTranslation } from 'react-i18next';
import { HiMiniLanguage } from 'react-icons/hi2';

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import { LANGUAGES } from '@/i18n/languages';

/**
 * The language menu in the desktop header: the translate icon opens a list of
 * the languages in `LANGUAGES`, each named in its own language. The current
 * one is ticked, and screen readers hear it as "checked" (radio items).
 * Choosing one switches the UI language; i18next saves it for the next visit.
 *
 * @returns The language menu.
 */
export function LanguageSwitcherDesktop() {
	const { i18n, t } = useTranslation();

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				aria-label={t('COMMON.LANGUAGE')}
				className="flex cursor-pointer items-center justify-center rounded-sm outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
			>
				<HiMiniLanguage className="h-6 w-6 transition-colors" />
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuRadioGroup
					value={i18n.resolvedLanguage}
					onValueChange={(code: string) => i18n.changeLanguage(code)}
				>
					{/* closeOnClick: radio items stay open by default */}
					{LANGUAGES.map(({ code, name }) => (
						<DropdownMenuRadioItem
							key={code}
							value={code}
							closeOnClick
							className="data-checked:text-brand"
						>
							<span>{code.toUpperCase()}</span>
							{/* lang: screen readers say "Français" in French
							    (WCAG 3.1.2, Language of Parts) */}
							<span lang={code} className="flex-1 font-medium">
								{name}
							</span>
						</DropdownMenuRadioItem>
					))}
				</DropdownMenuRadioGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
