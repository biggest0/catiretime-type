interface FormErrorProps {
	message?: string | null;
}

/**
 * The error of a whole form, such as a refused sign-in: what `TextField`'s
 * `error` is for one field. `role="alert"` makes screen readers read it out
 * when it appears, since nothing else tells them the submit failed.
 *
 * Render it always and pass the message when there is one:
 * `<FormError message={error} />`.
 *
 * @param props.message - What went wrong, already translated; `null`,
 *   `undefined` or `''` while nothing has.
 * @returns The message, or nothing.
 */
export function FormError({ message }: FormErrorProps) {
	if (!message) return null;

	return (
		<p role="alert" className="text-sm text-destructive">
			{message}
		</p>
	);
}
