import { useRef, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { FcGoogle } from 'react-icons/fc';
import { Link, Navigate, useLocation } from 'react-router-dom';

import { FormError } from '@/components/common/form/FormError';
import { TextField } from '@/components/common/form/TextField';
import { SectionHeader } from '@/components/common/layout/SectionHeader';
import { PageMeta } from '@/components/common/seo/PageMeta';
import { buttonVariants } from '@/components/ui/buttonVariants';
import { PAGE_ROUTES } from '@/constants/routes';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { authErrorMessage } from '@/utils/auth/authErrors';
import {
	isGoogleLoginAvailable,
	startGoogleLogin,
} from '@/utils/auth/googleLogin';

/** A link inside a line of text: underlined, since colour alone isn't a cue. */
const TEXT_LINK = 'text-brand underline underline-offset-4';

/**
 * Where a visitor goes once signed in: back to the page that sent them to
 * log in, or the account page.
 *
 * @param state - The navigation state they arrived with. A guarded page
 *   sends `{ from: '/its-path' }`.
 * @returns A path inside the app. Anything else in `from` (another site's
 *   address, `//host`, not text) is ignored.
 */
function destinationAfterLogin(state: unknown): string {
	const from =
		typeof state === 'object' && state !== null && 'from' in state
			? state.from
			: undefined;
	// one leading slash: a path of this app
	return typeof from === 'string' && /^\/(?!\/)/.test(from)
		? from
		: PAGE_ROUTES.ACCOUNT;
}

/**
 * The login page: email and password, or Google when the build has its
 * settings. Empty fields are named one by one, with focus on the first. A
 * refused sign-in shows one message for the form (`authErrorMessage`).
 *
 * A signed-in visitor never sees the form: they're sent on at once. The same
 * rule moves the visitor on after a successful login, so there is no
 * `navigate()` call here.
 *
 * @returns The login page.
 */
export default function LoginPage() {
	const { t } = useTranslation();
	const location = useLocation();
	const { isAuthenticated, login } = useAuth();

	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	// which fields the last submit found empty
	const [missing, setMissing] = useState({ email: false, password: false });
	// What the last sign-in threw, kept as thrown: the message is worked out
	// while rendering, so it follows a change of language. Wrapped in an
	// object because anything can be thrown, even `undefined`.
	const [failure, setFailure] = useState<{ error: unknown } | null>(null);
	const [googleFailed, setGoogleFailed] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const emailRef = useRef<HTMLInputElement>(null);
	const passwordRef = useRef<HTMLInputElement>(null);

	// signed in already, or just now: on to where they were going. `replace`
	// keeps the login form out of the Back button's way.
	if (isAuthenticated) {
		return <Navigate to={destinationAfterLogin(location.state)} replace />;
	}

	/** @param event - The form's submit. */
	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		// the button stays focusable while a sign-in is out, so guard here
		if (isSubmitting) return;

		setFailure(null);
		setGoogleFailed(false);

		// a password is sent exactly as typed; spaces around an email are
		// never meant
		const missingNow = {
			email: email.trim() === '',
			password: password === '',
		};
		setMissing(missingNow);
		// A field's message is read out when the field has focus, so go to
		// the first one that needs fixing.
		if (missingNow.email) return emailRef.current?.focus();
		if (missingNow.password) return passwordRef.current?.focus();

		setIsSubmitting(true);
		try {
			await login(email.trim(), password);
		} catch (error) {
			setFailure({ error });
		} finally {
			setIsSubmitting(false);
		}
	};

	/** Leaves for Google, or says the sign-in couldn't start. */
	const handleGoogleLogin = () => {
		setFailure(null);
		setGoogleFailed(!startGoogleLogin());
	};

	const formMessage = failure
		? authErrorMessage(t, failure.error, 'login')
		: googleFailed
			? t('AUTH.GOOGLE_FAILED')
			: null;

	return (
		<section className="py-6">
			{/* nothing here for a search engine */}
			<PageMeta title={t('SEO.LOGIN.TITLE')} noindex />
			<SectionHeader title={t('PAGES.LOGIN.TITLE')} as="h1" />

			<div className="max-w-sm pt-2">
				{/* noValidate: the page shows its own messages, in the UI
				    language, instead of the browser's bubbles */}
				<form
					className="flex flex-col gap-4"
					onSubmit={handleSubmit}
					noValidate
				>
					<TextField
						ref={emailRef}
						label={t('AUTH.EMAIL')}
						type="email"
						name="email"
						autoComplete="email"
						required
						value={email}
						onChange={(event) => {
							setEmail(event.target.value);
							setMissing((current) => ({ ...current, email: false }));
						}}
						error={missing.email ? t('AUTH.EMAIL_REQUIRED') : undefined}
					/>
					<TextField
						ref={passwordRef}
						label={t('AUTH.PASSWORD')}
						type="password"
						name="password"
						autoComplete="current-password"
						required
						value={password}
						onChange={(event) => {
							setPassword(event.target.value);
							setMissing((current) => ({ ...current, password: false }));
						}}
						error={missing.password ? t('AUTH.PASSWORD_REQUIRED') : undefined}
					/>

					<FormError message={formMessage} />

					{/* aria-disabled, not disabled: a disabled button loses
					    keyboard focus. handleSubmit ignores the extra clicks. */}
					<button
						type="submit"
						aria-disabled={isSubmitting}
						className={cn(
							buttonVariants(),
							'aria-disabled:cursor-not-allowed aria-disabled:opacity-50'
						)}
					>
						{isSubmitting ? t('AUTH.LOGGING_IN') : t('AUTH.LOGIN')}
					</button>
				</form>

				{isGoogleLoginAvailable && (
					<>
						{/* lines drawn as borders: a background colour would
						    vanish in forced colours */}
						<div className="my-4 flex items-center gap-3">
							<div className="flex-1 border-t border-border-subtle" />
							<span className="text-xs text-muted-foreground">
								{t('AUTH.OR')}
							</span>
							<div className="flex-1 border-t border-border-subtle" />
						</div>
						<button
							type="button"
							onClick={handleGoogleLogin}
							className={cn(buttonVariants({ variant: 'outline' }), 'w-full')}
						>
							{/* decorative: the button's text names it */}
							<FcGoogle aria-hidden className="mr-2 size-4" />
							{t('AUTH.SIGN_IN_GOOGLE')}
						</button>
					</>
				)}

				<p className="mt-6 text-sm">
					<Link to={PAGE_ROUTES.RESET_PASSWORD} className={TEXT_LINK}>
						{t('AUTH.FORGOT_PASSWORD')}
					</Link>
				</p>
				<p className="mt-2 text-sm text-muted-foreground">
					{t('AUTH.NO_ACCOUNT')}{' '}
					<Link to={PAGE_ROUTES.REGISTER} className={TEXT_LINK}>
						{t('AUTH.REGISTER')}
					</Link>
				</p>
			</div>
		</section>
	);
}
