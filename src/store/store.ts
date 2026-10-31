import { configureStore } from '@reduxjs/toolkit';

import { apiSlice } from '@/store/api/apiSlice';

/**
 * The Redux store. It holds RTK Query's cache of API data; the app keeps no
 * other state in Redux.
 */
export const store = configureStore({
	reducer: {
		[apiSlice.reducerPath]: apiSlice.reducer,
	},
	// RTK Query's middleware runs the requests, the caching and the
	// invalidation
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware().concat(apiSlice.middleware),
});
