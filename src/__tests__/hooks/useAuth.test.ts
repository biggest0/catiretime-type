import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useAuth } from '@/hooks/useAuth';

const user = { id: 'u1', email: 'cat@example.com' };

afterEach(() => {
	vi.restoreAllMocks();
	localStorage.clear();
});

describe('useAuth', () => {
	it('re-renders the component when the session changes', async () => {
		// a new response per call: a body can only be read once
		vi.spyOn(globalThis, 'fetch').mockImplementation(() =>
			Promise.resolve(new Response(JSON.stringify({ user }), { status: 200 }))
		);
		const { result } = renderHook(() => useAuth());

		await act(() => result.current.login(user.email, 'pw'));
		expect(result.current).toMatchObject({ user, isAuthenticated: true });

		await act(() => result.current.logout());
		expect(result.current).toMatchObject({
			user: null,
			isAuthenticated: false,
		});
	});
});
