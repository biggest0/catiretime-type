// localStorage keys. Each one names data already saved in visitors' browsers:
// renaming a key silently loses what they stored under the old name.

/** The signed-in user, saved at login so a reload knows who was signed in. */
export const AUTH_USER = 'auth_user';

/** Display settings such as the theme (`AppSetting`). */
export const APP_SETTING = 'appSetting';

/**
 * The UI language the visitor picked. i18next's language detector reads and
 * writes it; the value is the detector's default name.
 */
export const UI_LANGUAGE = 'i18nextLng';

// Cookies

/**
 * Readable cookie, shared by every Çatire app, saying that a session exists.
 * It lets an app skip the session refresh call for visitors who aren't
 * signed in.
 */
export const SHARED_SESSION_COOKIE = 'catire_session';
