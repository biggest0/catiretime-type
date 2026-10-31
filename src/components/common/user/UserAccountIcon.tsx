import { useTranslation } from 'react-i18next';
import { LuUserRound } from 'react-icons/lu';
import { Link } from 'react-router-dom';

import { PAGE_ROUTES } from '@/constants/routes';
import { useAuth } from '@/hooks/useAuth';

/**
 * The person icon in the desktop header: a link to the account page when
 * signed in, to the login page otherwise, named for screen readers
 * ("Account" or "Log In"). While the startup session check runs, a visitor
 * with a saved user already counts as signed in.
 *
 * @returns The account or login link.
 */
export function UserAccountIcon() {
	const { t } = useTranslation();
	const { isAuthenticated } = useAuth();

	return (
		<Link
			to={isAuthenticated ? PAGE_ROUTES.ACCOUNT : PAGE_ROUTES.LOGIN}
			aria-label={
				isAuthenticated ? t('ACCOUNT.ACCOUNT_LABEL') : t('AUTH.LOGIN')
			}
		>
			<LuUserRound className="h-6 w-6 cursor-pointer transition-colors hover:text-foreground" />
		</Link>
	);
}
