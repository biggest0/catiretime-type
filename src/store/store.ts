import { configureStore } from '@reduxjs/toolkit';

import { apiSlice } from '@/store/api/apiSlice';

/**
 * Builds a Redux store. It holds RTK Query's cache of API data; the app
 * keeps no other state in Redux. The app uses the one below; tests build a
 * new one each, so one test's cached data can't reach the next.
 *
 * @returns A new, empty store.
 */
export function createAppStore() {
	return configureStore({
		reducer: {
			[apiSlice.reducerPath]: apiSlice.reducer,
		},
		// RTK Query's middleware runs the requests, the caching and the
		// invalidation
		middleware: (getDefaultMiddleware) =>
			getDefaultMiddleware().concat(apiSlice.middleware),
	});
}

/** The app's store. */
export const store = createAppStore();
