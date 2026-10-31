import { useSyncExternalStore } from 'react';

import { authStore, type AuthState } from '@/auth/authStore';

/** What `useAuth()` gives a component. */
export interface UseAuthResult extends AuthState {
	login: (email: string, password: string) => Promise<void>;
	register: (email: string, password: string) => Promise<void>;
	loginWithGoogle: (loginCode: string) => Promise<void>;
	logout: () => Promise<void>;
}

/**
 * Reads the session and the functions that change it. The component
 * re-renders whenever the session changes.
 *
 * @returns The user, whether they're signed in, whether the startup check is
 * still running, and the sign-in and sign-out functions.
 */
export function useAuth(): UseAuthResult {
	// subscribes on mount, unsubscribes on unmount, and re-renders when
	// getState returns a different object
	const state = useSyncExternalStore(authStore.subscribe, authStore.getState);

	return {
		...state,
		login: authStore.login,
		register: authStore.register,
		loginWithGoogle: authStore.loginWithGoogle,
		logout: authStore.logout,
	};
}
