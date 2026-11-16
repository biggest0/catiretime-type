import { describe, expect, it } from 'vitest';

import { PAGE_ROUTES } from '@/constants/routes';
import {
	destinationAfterLogin,
	readLoginPageState,
} from '@/utils/auth/loginReturn';

describe('destinationAfterLogin', () => {
	it('goes back to the page the visitor logged in from', () => {
		expect(destinationAfterLogin(PAGE_ROUTES.ACCOUNT)).toBe(
			PAGE_ROUTES.ACCOUNT
		);
		// with its query and #place
		expect(destinationAfterLogin('/search?q=cats#results')).toBe(
			'/search?q=cats#results'
		);
	});

	it('goes to the home page when there is no page to go back to', () => {
		expect(destinationAfterLogin(undefined)).toBe(PAGE_ROUTES.HOME);
		expect(destinationAfterLogin(null)).toBe(PAGE_ROUTES.HOME);
		expect(destinationAfterLogin('')).toBe(PAGE_ROUTES.HOME);
	});

	it.each([
		['the login page', '/login'],
		['the login page with a query', '/login?next=1'],
		['the login page with a trailing slash', '/login/'],
		// going back there would only show "invalid sign-in"
		['the Google return page', '/auth/google/callback?state=x'],
	])('goes to the home page instead of %s', (_label, from) => {
		expect(destinationAfterLogin(from)).toBe(PAGE_ROUTES.HOME);
	});

	it.each([
		['another site', 'https://elsewhere.example/page'],
		['a protocol-relative address', '//elsewhere.example/page'],
		// browsers read a backslash as a slash
		['a backslash address', '/\\elsewhere.example/page'],
		// and drop tabs and line breaks from addresses
		['an address hiding a tab', '/\t/elsewhere.example/page'],
		['a script address', 'javascript:alert(1)'],
		['something that is not text', 42],
	])('never leaves the app for %s', (_label, from) => {
		expect(destinationAfterLogin(from)).toBe(PAGE_ROUTES.HOME);
	});
});

describe('readLoginPageState', () => {
	it('reads the page to return to and a Google problem', () => {
		expect(
			readLoginPageState({ from: '/somewhere', googleProblem: 'network' })
		).toEqual({ from: '/somewhere', googleProblem: 'network' });
	});

	it('ignores anything it does not know', () => {
		expect(readLoginPageState(null)).toEqual({
			from: undefined,
			googleProblem: null,
		});
		expect(readLoginPageState({ googleProblem: 'made up' })).toEqual({
			from: undefined,
			googleProblem: null,
		});
	});
});
