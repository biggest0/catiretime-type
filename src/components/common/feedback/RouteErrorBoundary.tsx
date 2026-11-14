import { Component, type ErrorInfo, type ReactNode } from 'react';

import { RouteErrorFallback } from '@/components/common/feedback/RouteErrorFallback';
import { ROUTE_RELOAD_ATTEMPTED } from '@/constants/keys';

/**
 * How long after an automatic reload another one is allowed, in ms. A file
 * that is really missing fails again within seconds of the reload, so it
 * can't loop; a later deploy in the same tab comes long after.
 */
const RELOAD_COOLDOWN_MS = 60_000;

/**
 * Tells whether an error means "the page file this tab asked for is no
 * longer on the server". Browsers word it differently: Chrome says "Failed
 * to fetch dynamically imported module", Safari "Importing a module script
 * failed", Firefox "error loading dynamically imported module".
 * e2e/stalePage.spec.ts checks all three against the real browsers.
 *
 * @param error - What was thrown.
 * @returns `true` for a missing page file.
 */
function isStaleChunkError(error: unknown): boolean {
	const message = error instanceof Error ? error.message : String(error);
	return /dynamically imported module|Importing a module script failed|ChunkLoadError/i.test(
		message
	);
}

/**
 * Reads when this tab last reloaded for a missing page file.
 *
 * @returns The time in ms since 1970, `0` if it never has, or `null` if
 *   storage is blocked.
 */
function readLastReload(): number | null {
	try {
		return Number(sessionStorage.getItem(ROUTE_RELOAD_ATTEMPTED)) || 0;
	} catch {
		return null;
	}
}

/**
 * Records that this tab is reloading now.
 *
 * @param time - The current time in ms since 1970.
 * @returns `true` if it was saved.
 */
function saveReloadTime(time: number): boolean {
	try {
		sessionStorage.setItem(ROUTE_RELOAD_ATTEMPTED, String(time));
		return true;
	} catch {
		return false;
	}
}

interface RouteErrorBoundaryProps {
	children: ReactNode;
	/** Changes on every navigation: `App` passes the location's key. */
	resetKey: string;
}

interface RouteErrorBoundaryState {
	failed: boolean;
}

/**
 * Catches errors while rendering or loading what's below it, so one broken
 * part can't blank the whole app: without a boundary, React removes the
 * entire tree and leaves an empty page. `App` uses two: around each page,
 * and around the whole frame.
 *
 * Each deploy replaces the site's files, so a tab left open across a deploy
 * asks for page files that no longer exist. Reloading fetches the new ones,
 * so for that error it reloads by itself, at most once a minute, and never
 * while the device is offline (the same error, but a reload can't help). Any
 * other error keeps the app's frame and shows `RouteErrorFallback`, until
 * the visitor goes to another page: then it renders the new page again.
 *
 * @param props.children - The page to protect.
 * @param props.resetKey - A value that changes on every navigation (the
 * 	location's key); after a failure, a new value clears the fallback.
 * @returns The page, or the fallback once it has failed.
 */
export class RouteErrorBoundary extends Component<
	RouteErrorBoundaryProps,
	RouteErrorBoundaryState
> {
	state: RouteErrorBoundaryState = { failed: false };

	/**
	 * Switches to the fallback after an error below.
	 *
	 * @returns The new state.
	 */
	static getDerivedStateFromError(): RouteErrorBoundaryState {
		return { failed: true };
	}

	/**
	 * Logs the error and, for a missing page file, reloads the page.
	 *
	 * @param error - What was thrown.
	 * @param info - React's details, including which components were rendering.
	 */
	componentDidCatch(error: Error, info: ErrorInfo) {
		// with the component stack, which React's own production log leaves out
		console.error('Route failed to render', error, info.componentStack);

		if (!isStaleChunkError(error)) return;

		// With no network the file isn't missing, just out of reach, and a
		// reload would swap the app for the browser's "no internet" page. The
		// fallback keeps the header and the loaded pages in reach; its button
		// reloads when the visitor is back online.
		if (!navigator.onLine) return;

		// Without storage there's no guard against a reload loop, so the
		// fallback's button leaves the reload to the visitor. This code must not
		// throw: an error here escapes the boundary and blanks the page.
		const now = Date.now();
		const lastReload = readLastReload();
		if (lastReload === null || now - lastReload < RELOAD_COOLDOWN_MS) return;
		if (!saveReloadTime(now)) return;
		window.location.reload();
	}

	/**
	 * Clears the fallback when the visitor navigates after a failure, so the
	 * error stays on the page that failed. Without this, every page would show
	 * the fallback until a full reload, even with working links in the header.
	 *
	 * @param prevProps - The props of the previous render.
	 */
	componentDidUpdate(prevProps: RouteErrorBoundaryProps) {
		if (this.state.failed && prevProps.resetKey !== this.props.resetKey) {
			this.setState({ failed: false });
		}
	}

	/**
	 * Renders the page, or the fallback once something below has failed.
	 *
	 * @returns The children or the fallback.
	 */
	render() {
		return this.state.failed ? <RouteErrorFallback /> : this.props.children;
	}
}
