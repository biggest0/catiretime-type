/// <reference types="vite/client" />

// Types for the VITE_* variables in the .env files. Keep this file free of
// imports: an import turns it into a module, and these declarations would
// stop merging with Vite's own.

interface ViteTypeOptions {
	// Reading an undeclared import.meta.env key is a type error, so a typo in
	// a variable name fails the build instead of yielding undefined at runtime.
	strictImportMetaEnv: unknown;
}

interface ImportMetaEnv {
	readonly VITE_API_URL: string;
	readonly VITE_GOOGLE_CLIENT_ID: string;
	readonly VITE_GOOGLE_REDIRECT_URI: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
