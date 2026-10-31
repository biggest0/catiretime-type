// Shapes exchanged with the backend's auth endpoints. Tokens never appear
// here: they travel as HttpOnly cookies that page code can't read.

/** The signed-in user, as the backend returns it. */
export interface AuthUser {
	id: string;
	email: string;
}

/** What register and login send. */
export interface Credentials {
	email: string;
	password: string;
}

/** What register, login, refresh and the Google exchange return. */
export interface AuthResponse {
	user: AuthUser;
}
