import { describe, expect, it } from 'vitest';

import { ApiError } from '@/api/authApi';
import i18n from '@/i18n/config';
import en from '@/i18n/en/common.json';
import fr from '@/i18n/fr/common.json';
import { authErrorMessage } from '@/utils/auth/authErrors';

/** `t` fixed to one language, whatever the test before left selected. */
const t = i18n.getFixedT('en');

describe('authErrorMessage', () => {
	it("says the server couldn't be reached when fetch itself fails", () => {
		// what fetch throws offline, or when the browser blocks the request
		const offline = new TypeError('Failed to fetch');

		expect(authErrorMessage(t, offline)).toBe(en.AUTH.NETWORK_ERROR);
	});

	describe('an answer with a code', () => {
		it.each([
			['INVALID_CREDENTIALS', en.AUTH.INVALID_CREDENTIALS],
			['EMAIL_IN_USE', en.AUTH.EMAIL_IN_USE],
			['RATE_LIMITED', en.AUTH.RATE_LIMITED],
			['INTERNAL_ERROR', en.AUTH.SERVER_ERROR],
			['ROUTE_NOT_FOUND', en.AUTH.SERVER_ERROR],
			['INVALID_JSON', en.AUTH.SERVER_ERROR],
			['PAYLOAD_TOO_LARGE', en.AUTH.SERVER_ERROR],
		])('translates %s', (code, message) => {
			// a 400 alone would show the server's text: the code decides
			const error = new ApiError(400, 'whatever the server wrote', code);

			expect(authErrorMessage(t, error)).toBe(message);
		});

		it('reads the code before the status', () => {
			// The backend never sends this pair; it pins the order, since
			// today's codes and statuses always agree.
			const error = new ApiError(401, 'x', 'RATE_LIMITED');

			expect(authErrorMessage(t, error, 'login')).toBe(en.AUTH.RATE_LIMITED);
		});

		it('falls back to the status for a code it has no message for', () => {
			// a code added to the backend after this app was built
			const newer = (status: number, text: string) =>
				new ApiError(status, text, 'A_NEWER_CODE');

			expect(authErrorMessage(t, newer(429, 'x'))).toBe(en.AUTH.RATE_LIMITED);
			expect(authErrorMessage(t, newer(400, 'Pick a shorter name'))).toBe(
				'Pick a shorter name'
			);
		});

		it.each(['toString', 'constructor', '__proto__'])(
			'treats %s, a name every object has, as an unknown code',
			(code) => {
				const error = new ApiError(400, 'the server text', code);

				expect(authErrorMessage(t, error)).toBe('the server text');
			}
		);

		it('answers in the language of the `t` it is given', () => {
			const french = i18n.getFixedT('fr');
			const error = new ApiError(400, 'Invalid JSON body', 'INVALID_JSON');

			expect(authErrorMessage(french, error)).toBe(fr.AUTH.SERVER_ERROR);
		});
	});

	describe('an answer without a code (a server older than the codes)', () => {
		it('calls a 401 "wrong email or password" on the login form only', () => {
			const refused = new ApiError(401, 'Login code is invalid or expired');

			expect(authErrorMessage(t, refused, 'login')).toBe(
				en.AUTH.INVALID_CREDENTIALS
			);
			// elsewhere a 401 isn't about a password: the server's text says what
			expect(authErrorMessage(t, refused)).toBe(
				'Login code is invalid or expired'
			);
		});

		it.each([
			[409, en.AUTH.EMAIL_IN_USE],
			[429, en.AUTH.RATE_LIMITED],
			[500, en.AUTH.SERVER_ERROR],
			[502, en.AUTH.SERVER_ERROR],
		])('translates a %i answer', (status, message) => {
			const error = new ApiError(status, 'whatever the server wrote');

			expect(authErrorMessage(t, error, 'login')).toBe(message);
		});

		it("keeps the server's text for a rule the app has no message for", () => {
			const rule = new ApiError(400, 'Password must be at least 8 characters');

			expect(authErrorMessage(t, rule)).toBe(
				'Password must be at least 8 characters'
			);
		});

		it('answers in the language of the `t` it is given', () => {
			const french = i18n.getFixedT('fr');

			expect(authErrorMessage(french, new ApiError(429, 'x'))).toBe(
				fr.AUTH.RATE_LIMITED
			);
		});
	});

	it.each([
		['an answer the app could not use', new Error('The answer holds no user')],
		['an answer that was not JSON', new SyntaxError('Unexpected token <')],
		['something that is not an error', 'oops'],
	])('blames our side, not the network, for %s', (_label, thrown) => {
		expect(authErrorMessage(t, thrown)).toBe(en.AUTH.SERVER_ERROR);
	});
});
