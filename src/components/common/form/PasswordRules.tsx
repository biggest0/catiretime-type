import { useTranslation } from 'react-i18next';
import { LuCheck, LuCircle } from 'react-icons/lu';

import { cn } from '@/lib/utils';
import {
	PASSWORD_MIN_LENGTH,
	PASSWORD_RULES,
} from '@/utils/auth/passwordRules';

interface PasswordRulesProps {
	password: string;
}

/**
 * The rules a new password must meet, each ticked as soon as the password
 * meets it, so the visitor sees everything it needs before sending. Pass it
 * as a `TextField`'s `hint`: a screen reader on the field then reads the
 * list too.
 *
 * A met rule shows a tick and turns green; an unmet one shows an empty
 * circle. The shape tells them apart without the colour, and each line ends
 * with a hidden "met" or "not met yet" for screen readers, which can see
 * neither.
 *
 * @param props.password - The password as typed so far.
 * @returns The list of rules.
 */
export function PasswordRules({ password }: PasswordRulesProps) {
	const { t } = useTranslation();

	return (
		<div className="text-sm">
			<p className="text-muted-foreground">{t('AUTH.PASSWORD_RULES')}</p>
			<ul className="mt-1 flex flex-col gap-0.5">
				{PASSWORD_RULES.map((rule) => {
					const met = rule.isMetBy(password);
					return (
						<li
							key={rule.code}
							className={cn(
								'flex items-center gap-2',
								met ? 'text-success' : 'text-muted-foreground'
							)}
						>
							{met ? (
								<LuCheck aria-hidden className="size-3.5 shrink-0" />
							) : (
								<LuCircle aria-hidden className="size-3.5 shrink-0" />
							)}
							<span>
								{t(rule.label, { min: PASSWORD_MIN_LENGTH })}
								<span className="sr-only">
									{', '}
									{met
										? t('AUTH.PASSWORD_RULE_MET')
										: t('AUTH.PASSWORD_RULE_NOT_MET')}
								</span>
							</span>
						</li>
					);
				})}
			</ul>
		</div>
	);
}
