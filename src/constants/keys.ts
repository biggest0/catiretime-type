// localStorage keys. Each one names data already saved in visitors' browsers:
// renaming a key silently loses what they stored under the old name.

/** The signed-in user, saved at login so a reload knows who was signed in. */
export const AUTH_USER = 'auth_user';

/**
 * Display settings such as the theme (`AppSetting`). The theme script in
 * index.html repeats this value.
 */
export const APP_SETTING = 'appSetting';

/**
 * The UI language the visitor picked. i18next's language detector reads and
 * writes it; the value is the detector's default name.
 */
export const UI_LANGUAGE = 'i18nextLng';

// sessionStorage keys: one value per tab, cleared when the tab closes.

/**
 * The random value sent along with a Google sign-in. The page Google returns
 * to compares it with what comes back, so a return nobody started here is
 * refused.
 */
export const GOOGLE_OAUTH_STATE = 'google_oauth_state';

/**
 * The page a Google sign-in started from, saved next to its state, so the
 * visitor comes back to it after the trip through Google.
 */
export const GOOGLE_OAUTH_RETURN_TO = 'google_oauth_return_to';

/**
 * When this tab last reloaded itself to replace page files a deploy removed
 * (`RouteErrorBoundary`), so it never reloads in a loop.
 */
export const ROUTE_RELOAD_ATTEMPTED = 'routeReloadAttempted';
