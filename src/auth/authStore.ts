import {
	ApiError,
	postGoogleExchange,
	postLogin,
	postLogout,
	postRefreshToken,
	postRegister,
} from '@/api/authApi';
import { AUTH_USER } from '@/constants/keys';
import type { AuthUser } from '@/types/authTypes';

// The session as the app knows it. The real session is the backend's HttpOnly
// cookies, which page code can't read; this store keeps the user they belong
// to, so the UI can show who's signed in. It lives outside React because
// non-React code (the API layer) must refresh it too. Components read it
// through useAuth().

/** What the store holds. */
export interface AuthState {
	/** The signed-in user, or null. */
	user: AuthUser | null;
	/** Whether a user is signed in, as far as the app knows. */
	isAuthenticated: boolean;
	/** True until the startup check has answered: don't decide anything yet. */
	isLoading: boolean;
}

/**
 * Checks that a value has the shape of a user.
 *
 * @param value - Whatever was found in storage.
 * @returns `true` for an object with a string `id` and `email`.
 */
function isAuthUser(value: unknown): value is AuthUser {
	return (
		typeof value === 'object' &&
		value !== null &&
		'id' in value &&
		typeof value.id === 'string' &&
		'email' in value &&
		typeof value.email === 'string'
	);
}

/**
 * Reads the user saved at the last sign-in. Never throws.
 *
 * @returns The saved user, or null when there's none, or it's unreadable or
 * not a user.
 */
function readSavedUser(): AuthUser | null {
	try {
		const raw = localStorage.getItem(AUTH_USER);
		if (raw === null) return null;

		const saved: unknown = JSON.parse(raw);
		return isAuthUser(saved) ? saved : null;
	} catch {
		return null;
	}
}

/**
 * Saves the user, or removes the saved one. A failure only costs showing the
 * user straight away on the next load, so it's logged, not thrown.
 *
 * @param user - The user to save, or null to remove it.
 */
function saveUser(user: AuthUser | null): void {
	try {
		if (user) localStorage.setItem(AUTH_USER, JSON.stringify(user));
		else localStorage.removeItem(AUTH_USER);
	} catch (error) {
		console.error('Could not save the signed-in user:', error);
	}
}

const savedUser = readSavedUser();

let state: AuthState = {
	user: savedUser,
	isAuthenticated: savedUser !== null,
	isLoading: true,
};

const listeners = new Set<() => void>();

/**
 * Replaces the state with a new object and tells every subscriber. Always a
 * new object, never a change to the old one: that's how
 * useSyncExternalStore sees that something changed.
 *
 * @param patch - The fields that change.
 */
function setState(patch: Partial<AuthState>): void {
	state = { ...state, ...patch };
	listeners.forEach((listener) => listener());
}

/**
 * Records a signed-in user. The server has already set the cookies.
 *
 * @param user - The user the server returned.
 */
function signIn(user: AuthUser): void {
	saveUser(user);
	setState({ user, isAuthenticated: true });
}

/** Forgets the signed-in user. */
function signOut(): void {
	saveUser(null);
	setState({ user: null, isAuthenticated: false });
}

/**
 * Whether a session might exist, so startup should check. Always true for
 * now: page code can't see the HttpOnly session cookies, and a visitor who
 * signed in on another Çatire app has nothing saved here. Once sign-in sets
 * `SHARED_SESSION_COOKIE`, check it here, so visitors without a session
 * skip the call.
 *
 * @returns `true` when startup should ask the server.
 */
function hasSessionHint(): boolean {
	return true;
}

/** The refresh in progress, shared by everyone who asks meanwhile. */
let inflightRefresh: Promise<boolean> | null = null;

/**
 * Asks the server for fresh session cookies, once.
 *
 * @returns `true` when the session is valid now.
 */
async function performRefresh(): Promise<boolean> {
	try {
		const { user } = await postRefreshToken();
		signIn(user);
		return true;
	} catch (error) {
		// only a 401 means "no session". Offline or a server error says
		// nothing about the session, so the visitor stays signed in
		if (error instanceof ApiError && error.status === 401) signOut();
		return false;
	}
}

/**
 * Refreshes the session. Callers that ask while a refresh is in progress get
 * the same answer: the server replaces the refresh cookie on every refresh,
 * so a second request with the old cookie would be refused.
 *
 * @returns `true` when the session is valid now. On `false`, the store has
 * already signed out if the server said there's no session.
 */
function refresh(): Promise<boolean> {
	if (!inflightRefresh) {
		inflightRefresh = performRefresh().finally(() => {
			inflightRefresh = null;
		});
	}
	return inflightRefresh;
}

/**
 * Checks the session once at startup. Call it once per page load, from
 * main.tsx; `isLoading` stays true until it has answered.
 */
async function bootstrap(): Promise<void> {
	try {
		if (hasSessionHint()) await refresh();
	} finally {
		setState({ isLoading: false });
	}
}

/**
 * Signs in with email and password.
 *
 * @param email - The account's email.
 * @param password - The account's password.
 * @throws ApiError from the server, for the page to turn into a message.
 */
async function login(email: string, password: string): Promise<void> {
	const { user } = await postLogin({ email, password });
	signIn(user);
}

/**
 * Creates an account and signs it in.
 *
 * @param email - The new account's email.
 * @param password - The new account's password.
 * @throws ApiError from the server, for the page to turn into a message.
 */
async function register(email: string, password: string): Promise<void> {
	const { user } = await postRegister({ email, password });
	signIn(user);
}

/**
 * Finishes a Google sign-in.
 *
 * @param loginCode - The one-time code from the Google return URL.
 * @throws ApiError from the server, for the page to turn into a message.
 */
async function loginWithGoogle(loginCode: string): Promise<void> {
	const { user } = await postGoogleExchange(loginCode);
	signIn(user);
}

/** Signs out, here even when the server can't be told. */
async function logout(): Promise<void> {
	try {
		await postLogout();
	} catch {
		// offline, or the session had already ended: the visitor asked to
		// sign out, so do it here anyway
	}
	signOut();
}

/**
 * Returns the current state: the same object until something changes.
 *
 * @returns The current state.
 */
function getState(): AuthState {
	return state;
}

/**
 * Calls `listener` after every change.
 *
 * @param listener - The function to call.
 * @returns A function that stops the calls.
 */
function subscribe(listener: () => void): () => void {
	listeners.add(listener);
	return () => {
		listeners.delete(listener);
	};
}

/** The one session store, shared by components (through useAuth) and the API layer. */
export const authStore = {
	getState,
	subscribe,
	bootstrap,
	refresh,
	login,
	register,
	loginWithGoogle,
	logout,
};
