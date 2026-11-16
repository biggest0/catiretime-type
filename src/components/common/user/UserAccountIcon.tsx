import { useTranslation } from 'react-i18next';
import { LuUserRound } from 'react-icons/lu';
import { Link, useLocation } from 'react-router-dom';

import { MobileNavLink } from '@/components/layout/navBar/MobileNavLink';
import { PAGE_ROUTES } from '@/constants/routes';
import { useAuth } from '@/hooks/useAuth';
import type { LoginPageState } from '@/utils/auth/loginReturn';

interface UserAccountIconProps {
	variant?: 'icon' | 'full';
}

/**
 * The account link: to the account page when signed in, to the login page
 * otherwise ("Account" or "Log In"). While the startup session check runs, a
 * visitor with a saved user already counts as signed in. The login link
 * tells the login page which page the visitor is on, so they come back to it
 * once signed in.
 *
 * @param props.variant - `icon` (default): the person icon of the desktop
 *   header, named for screen readers. `full`: a full-width text link for the
 *   mobile menu.
 * @returns The account or login link.
 */
export function UserAccountIcon({ variant = 'icon' }: UserAccountIconProps) {
	const { t } = useTranslation();
	const { isAuthenticated } = useAuth();
	const location = useLocation();

	const linkTo = isAuthenticated ? PAGE_ROUTES.ACCOUNT : PAGE_ROUTES.LOGIN;
	const label = isAuthenticated ? t('ACCOUNT.ACCOUNT_LABEL') : t('AUTH.LOGIN');
	const loginState: LoginPageState = {
		from: `${location.pathname}${location.search}${location.hash}`,
	};
	const state = isAuthenticated ? undefined : loginState;

	if (variant === 'full') {
		return <MobileNavLink linkTo={linkTo} linkLabel={label} state={state} />;
	}

	return (
		<Link to={linkTo} state={state} aria-label={label}>
			<LuUserRound className="h-6 w-6 cursor-pointer transition-colors hover:text-foreground" />
		</Link>
	);
}
