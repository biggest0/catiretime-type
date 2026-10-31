import { PAGE_ROUTES } from '@/constants/routes';

/**
 * The app's sections, in the order the header's section bar shows them. An
 * app adds or removes a section here, never in the JSX. `labelKey` is the
 * i18n key of its name.
 */
// `as const` keeps the label keys as literals, which the typed t() requires
export const NAV_SECTIONS = [
	{ path: PAGE_ROUTES.HOME, labelKey: 'NAVIGATION.HOME' },
] as const satisfies readonly { path: string; labelKey: string }[];
