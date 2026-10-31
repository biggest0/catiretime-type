import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { LANGUAGES } from '@/i18n/languages';
import type { Language } from '@/i18n/types';
import { cn } from '@/lib/utils';

/**
 * The mobile menu's language row: "Language" unfolds the languages beside
 * it, each named in its own language; the current one is underlined and
 * pressed (`aria-pressed`). Choosing one switches the UI language, which
 * i18next saves, and folds the list away. An inline disclosure rather than
 * a popup menu, so it stays in the menu's flow.
 *
 * @returns The language row.
 */
export function LanguageSwitcherMobile() {
	const { i18n, t } = useTranslation();
	const [isExpanded, setIsExpanded] = useState(false);

	/** @param code - The language to switch to. */
	const changeLanguage = (code: Language) => {
		i18n.changeLanguage(code);
		setIsExpanded(false);
	};

	return (
		<div className="flex items-center rounded-md px-4 text-foreground-secondary transition-colors hover:bg-muted">
			<button
				type="button"
				aria-expanded={isExpanded}
				onClick={() => setIsExpanded(!isExpanded)}
				className="mr-4 cursor-pointer py-2"
			>
				{t('COMMON.LANGUAGE')}
			</button>

			{/* Folded, the list is 0px wide and transparent; inert also takes
			    its buttons out of the keyboard order and away from screen
			    readers, which would otherwise reach them unseen (K40). */}
			<div
				inert={!isExpanded}
				className={cn(
					'flex overflow-hidden transition-all duration-300',
					isExpanded ? 'opacity-100' : 'max-w-0 opacity-0'
				)}
			>
				{LANGUAGES.map(({ code, name }) => {
					const isCurrent = i18n.resolvedLanguage === code;
					return (
						<button
							key={code}
							type="button"
							lang={code}
							aria-pressed={isCurrent}
							onClick={() => changeLanguage(code)}
							className={cn(
								'px-4 py-2 whitespace-nowrap transition-colors',
								isCurrent ? 'underline' : 'cursor-pointer hover:text-brand'
							)}
						>
							{name}
						</button>
					);
				})}
			</div>
		</div>
	);
}
