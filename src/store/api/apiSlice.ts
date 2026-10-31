import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type {
	BaseQueryFn,
	FetchArgs,
	FetchBaseQueryError,
} from '@reduxjs/toolkit/query';

import { authStore } from '@/auth/authStore';
import { API_URL } from '@/config/config';

/** Sends a request to the API with the session cookies attached. */
const baseQuery = fetchBaseQuery({ baseUrl: API_URL, credentials: 'include' });

/**
 * Sends every RTK Query request. When a signed-in visitor's request gets a
 * 401 (the short-lived access cookie expired), it refreshes the session once
 * and retries: the RTK Query docs' re-authorization pattern. Requests that
 * fail at the same time share one refresh (`authStore.refresh()`).
 *
 * @param args - The request: a path, or an object with the path and options.
 * @param api - RTK Query's helpers for this request (signal, dispatch…).
 * @param extraOptions - Per-endpoint options, passed through unchanged.
 * @returns The response data, or the error.
 */
const baseQueryWithReauth: BaseQueryFn<
	string | FetchArgs,
	unknown,
	FetchBaseQueryError
> = async (args, api, extraOptions) => {
	const result = await baseQuery(args, api, extraOptions);

	// any other answer, or a 401 for a visitor who isn't signed in (there's
	// no session to refresh), is simply the answer
	if (result.error?.status !== 401 || !authStore.getState().isAuthenticated) {
		return result;
	}

	// on false, return the original 401: if the session is gone, the store
	// has already signed out
	const refreshed = await authStore.refresh();
	return refreshed ? baseQuery(args, api, extraOptions) : result;
};

/**
 * The app's one RTK Query API. Each feature adds its endpoints with
 * `apiSlice.injectEndpoints`, so everything shares one cache, one reducer
 * and one middleware.
 */
export const apiSlice = createApi({
	reducerPath: 'api',
	baseQuery: baseQueryWithReauth,
	// names for cached data that a change can mark stale; each app adds its own
	tagTypes: [],
	endpoints: () => ({}),
});
