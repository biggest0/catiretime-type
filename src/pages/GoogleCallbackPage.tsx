import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { LoadingOverlay } from '@/components/common/feedback/LoadingOverlay';
import { SectionHeader } from '@/components/common/layout/SectionHeader';
import { PageMeta } from '@/components/common/seo/PageMeta';
import { PAGE_ROUTES } from '@/constants/routes';
import { useAuth } from '@/hooks/useAuth';
import {
	googleProblemFromError,
	readGoogleReturn,
	type GoogleLoginProblem,
} from '@/utils/auth/googleLogin';
import {
	destinationAfterLogin,
	type LoginPageState,
} from '@/utils/auth/loginReturn';

/**
 * Where the backend sends the visitor back after Google, with a one-time
 * code and the `state` this tab saved (`/auth/google/callback`). It checks
 * the return (`readGoogleReturn`), trades the code for the session, then
 * goes back to the page the visitor logged in from. Anything else ends on
 * the login page: quietly when the visitor cancelled at Google, otherwise
 * with the reason (`googleProblem`), keeping the page to come back to.
 *
 * Visitors only see the loading cat: the page does its work and leaves.
 *
 * @returns The page, while it works.
 */
export default function GoogleCallbackPage() {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const { loginWithGoogle } = useAuth();
	// The code works once, and React runs effects twice in development
	// (StrictMode). A ref survives that second run, so it keeps the work to
	// one try; a second try would spend a used code and fail.
	const started = useRef(false);

	useEffect(() => {
		if (started.current) return;
		started.current = true;

		const result = readGoogleReturn(searchParams);

		/**
		 * Back to the login form. `replace`: Back mustn't return here, where
		 * the code is spent.
		 *
		 * @param googleProblem - Why, to show there; none when cancelled.
		 */
		const backToLogin = (googleProblem?: GoogleLoginProblem) => {
			const state: LoginPageState = {
				from: result.returnTo ?? undefined,
				googleProblem,
			};
			navigate(PAGE_ROUTES.LOGIN, { replace: true, state });
		};

		if (result.outcome === 'cancelled') {
			backToLogin();
			return;
		}
		if (result.outcome === 'refused') {
			backToLogin(result.problem);
			return;
		}

		loginWithGoogle(result.loginCode).then(
			() => navigate(destinationAfterLogin(result.returnTo), { replace: true }),
			(error: unknown) => backToLogin(googleProblemFromError(error))
		);
	}, [loginWithGoogle, navigate, searchParams]);

	return (
		<section className="py-6">
			{/* a one-time address: nothing for a search engine */}
			<PageMeta title={t('SEO.GOOGLE_CALLBACK.TITLE')} noindex />
			<SectionHeader title={t('PAGES.GOOGLE_CALLBACK.TITLE')} as="h1" />
			<LoadingOverlay loading />
		</section>
	);
}
