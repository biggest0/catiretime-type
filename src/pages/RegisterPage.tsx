import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, Navigate, useLocation } from 'react-router-dom';

import { FormError } from '@/components/common/form/FormError';
import { PasswordRules } from '@/components/common/form/PasswordRules';
import { TextField } from '@/components/common/form/TextField';
import { SectionHeader } from '@/components/common/layout/SectionHeader';
import { PageMeta } from '@/components/common/seo/PageMeta';
import { buttonVariants } from '@/components/ui/buttonVariants';
import { PAGE_ROUTES } from '@/constants/routes';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { focusPageStart } from '@/utils/a11y/pageFocus';
import { authErrorMessage } from '@/utils/auth/authErrors';
import {
	destinationAfterLogin,
	readLoginPageState,
} from '@/utils/auth/loginReturn';
import { unmetPasswordRules } from '@/utils/auth/passwordRules';

/** A link inside a line of text: underlined, since colour alone isn't a cue. */
const TEXT_LINK = 'text-brand underline underline-offset-4';

/**
 * What's wrong with each field after a submit, as the key of its message
 * (translated while rendering, so it follows a change of language); `null`
 * while the field is fine.
 */
interface FieldProblems {
	email: 'AUTH.EMAIL_REQUIRED' | null;
	password: 'AUTH.NEW_PASSWORD_REQUIRED' | 'AUTH.PASSWORD_RULES_UNMET' | null;
	confirmation:
		'AUTH.CONFIRM_PASSWORD_REQUIRED' | 'AUTH.PASSWORDS_MISMATCH' | null;
}

const NO_PROBLEMS: FieldProblems = {
	email: null,
	password: null,
	confirmation: null,
};

/**
 * Checks the form before anything is sent: every field, so the visitor
 * sees all there is to fix at once. The email's format is left to the
 * backend, whose check differs from the browser's.
 *
 * @param email - The email field, as typed.
 * @param password - The password field, as typed.
 * @param confirmation - The password typed a second time.
 * @returns Each field's problem, or `null` for a field that's fine.
 */
function findProblems(
	email: string,
	password: string,
	confirmation: string
): FieldProblems {
	let passwordProblem: FieldProblems['password'] = null;
	if (password === '') {
		passwordProblem = 'AUTH.NEW_PASSWORD_REQUIRED';
	} else if (unmetPasswordRules(password).length > 0) {
		passwordProblem = 'AUTH.PASSWORD_RULES_UNMET';
	}

	let confirmationProblem: FieldProblems['confirmation'] = null;
	if (confirmation === '') {
		confirmationProblem = 'AUTH.CONFIRM_PASSWORD_REQUIRED';
	} else if (confirmation !== password) {
		confirmationProblem = 'AUTH.PASSWORDS_MISMATCH';
	}

	return {
		email: email.trim() === '' ? 'AUTH.EMAIL_REQUIRED' : null,
		password: passwordProblem,
		confirmation: confirmationProblem,
	};
}

/**
 * The register page: email, password (with its rules shown from the start)
 * and the password again. The form is checked before sending, each problem
 * under its field with focus on the first; a refusal from the server shows
 * one message for the form (`authErrorMessage`). Once the account exists,
 * the page says where the verification email went.
 *
 * A visitor who arrives signed in never sees the form: they're sent on, as
 * from the login page (`destinationAfterLogin`).
 *
 * @returns The register page.
 */
export default function RegisterPage() {
	const { t } = useTranslation();
	const location = useLocation();
	const { isAuthenticated, register } = useAuth();
	// the page to send a signed-in visitor on to
	const { from } = readLoginPageState(location.state);

	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [confirmation, setConfirmation] = useState('');
	const [problems, setProblems] = useState<FieldProblems>(NO_PROBLEMS);
	// What the last attempt threw, kept as thrown so its message follows a
	// change of language. Wrapped: anything can be thrown, even `undefined`.
	const [failure, setFailure] = useState<{ error: unknown } | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	// the address the new account was made for, once it exists
	const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);

	const emailRef = useRef<HTMLInputElement>(null);
	const passwordRef = useRef<HTMLInputElement>(null);
	const confirmationRef = useRef<HTMLInputElement>(null);

	// The form gives way to the "check your inbox" view, and the button that
	// had focus goes with it: focus its heading, as a new page would.
	useEffect(() => {
		if (registeredEmail !== null) focusPageStart();
	}, [registeredEmail]);

	if (registeredEmail !== null) {
		return <VerificationSent email={registeredEmail} />;
	}

	// Signed in already: on to where they were going. Not while registering:
	// that signs the visitor in before it returns, and the page must stay to
	// show where the verification email went.
	if (isAuthenticated && !isSubmitting) {
		return <Navigate to={destinationAfterLogin(from)} replace />;
	}

	/** @param event - The form's submit. */
	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		// the button stays focusable while a request is out, so guard here
		if (isSubmitting) return;

		setFailure(null);
		const found = findProblems(email, password, confirmation);
		setProblems(found);
		// A field's message is read out when the field has focus, so go to
		// the first one that needs fixing.
		if (found.email) return emailRef.current?.focus();
		if (found.password) return passwordRef.current?.focus();
		if (found.confirmation) return confirmationRef.current?.focus();

		// spaces around an email are never meant (the backend refuses
		// them); a password is sent exactly as typed
		const trimmedEmail = email.trim();
		setIsSubmitting(true);
		try {
			await register(trimmedEmail, password);
			setRegisteredEmail(trimmedEmail);
		} catch (error) {
			setFailure({ error });
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<section className="py-6">
			{/* nothing here for a search engine */}
			<PageMeta title={t('SEO.REGISTER.TITLE')} noindex />
			<SectionHeader title={t('PAGES.REGISTER.TITLE')} as="h1" />

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
							setProblems((current) => ({ ...current, email: null }));
						}}
						error={problems.email ? t(problems.email) : undefined}
					/>
					{/* new-password: browsers offer to make one up and save it */}
					<TextField
						ref={passwordRef}
						label={t('AUTH.PASSWORD')}
						type="password"
						name="password"
						autoComplete="new-password"
						required
						value={password}
						onChange={(event) => {
							setPassword(event.target.value);
							setProblems((current) => ({ ...current, password: null }));
						}}
						error={problems.password ? t(problems.password) : undefined}
						hint={<PasswordRules password={password} />}
					/>
					<TextField
						ref={confirmationRef}
						label={t('AUTH.CONFIRM_PASSWORD')}
						type="password"
						name="confirmPassword"
						autoComplete="new-password"
						required
						value={confirmation}
						onChange={(event) => {
							setConfirmation(event.target.value);
							setProblems((current) => ({ ...current, confirmation: null }));
						}}
						error={problems.confirmation ? t(problems.confirmation) : undefined}
					/>

					<FormError
						message={failure ? authErrorMessage(t, failure.error) : null}
					/>

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
						{isSubmitting ? t('AUTH.REGISTERING') : t('AUTH.REGISTER')}
					</button>
				</form>

				<p className="mt-6 text-sm text-muted-foreground">
					{t('AUTH.HAS_ACCOUNT')}{' '}
					<Link to={PAGE_ROUTES.LOGIN} className={TEXT_LINK}>
						{t('AUTH.LOGIN')}
					</Link>
				</p>
			</div>
		</section>
	);
}

interface VerificationSentProps {
	email: string;
}

/**
 * What the register page shows once the account exists: where the
 * verification email went, and what to do with it. The visitor is signed in
 * by then; the header shows it.
 *
 * @param props.email - The address the account was made for.
 * @returns The "check your inbox" view.
 */
function VerificationSent({ email }: VerificationSentProps) {
	const { t } = useTranslation();

	return (
		<section className="py-6">
			<PageMeta title={t('SEO.REGISTER.TITLE')} noindex />
			<SectionHeader title={t('PAGES.REGISTER.VERIFY_TITLE')} as="h1" />

			<div className="flex max-w-sm flex-col gap-2 pt-2 text-foreground-secondary">
				<p>{t('AUTH.VERIFY_EMAIL_SENT')}</p>
				{/* On its own line, as text: no markup in the translations, and
				    a long address wraps anywhere instead of widening the page */}
				<p className="font-bold text-foreground wrap-anywhere">{email}</p>
				<p>{t('AUTH.VERIFY_EMAIL_NEXT')}</p>
			</div>
		</section>
	);
}
