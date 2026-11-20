import { useId, type ComponentProps, type ReactNode } from 'react';

import { cn } from '@/lib/utils';

/**
 * A plain `<input>`'s own props, minus the three this component sets itself
 * to tie the label, the input and the error together.
 */
type InputProps = Omit<
	ComponentProps<'input'>,
	'id' | 'aria-invalid' | 'aria-describedby'
>;

interface TextFieldProps extends InputProps {
	label: string;
	error?: string;
	hint?: ReactNode;
}

/**
 * One line of a form: a label, a text input, the field's error message when
 * there is one, and an optional hint that stays under the field (a
 * password's rules). They are tied together, so a click on the label
 * focuses the input, and a screen reader on the input reads the label, that
 * the value is invalid, the message, then the hint.
 *
 * The input is drawn as a line under the text. That line is all that shows
 * where the field is, so it uses the `input` colour (3:1 against the page);
 * it turns red with an error. Focus is shown by the app's focus ring.
 *
 * Everything else is the input's own: pass `type`, `name`, `value`,
 * `onChange`, `disabled`, `required`… as on an `<input>`. Give `autoComplete`
 * whenever the field holds something the browser knows (`email`,
 * `current-password`, `new-password`): browsers and password managers fill
 * it in. No placeholder by default: the label is always visible.
 *
 * @param props.label - The field's name, already translated.
 * @param props.error - What's wrong with the value, already translated;
 *   leave it out while the value is fine.
 * @param props.hint - Help that is always shown under the field, already
 *   translated: text or a small component (`PasswordRules`).
 * @param props.className - Extra classes for the input, merged last.
 * @returns The label, the input, the error and the hint.
 */
export function TextField({
	label,
	error,
	hint,
	className,
	...inputProps
}: TextFieldProps) {
	// unique on the page, so two forms (or two fields) never share an id
	const id = useId();
	const errorId = `${id}-error`;
	const hintId = `${id}-hint`;

	// What a screen reader reads after the label, in order: the error first,
	// as the thing to fix, then the hint. With neither, the attribute is
	// left out: a description pointing at nothing helps nobody.
	const descriptions: string[] = [];
	if (error) descriptions.push(errorId);
	if (hint) descriptions.push(hintId);

	return (
		<div>
			<label htmlFor={id} className="mb-1 block text-sm text-muted-foreground">
				{label}
			</label>
			<input
				{...inputProps}
				id={id}
				// only while there is an error: `aria-invalid="false"` helps
				// nobody
				aria-invalid={error ? true : undefined}
				aria-describedby={
					descriptions.length > 0 ? descriptions.join(' ') : undefined
				}
				className={cn(
					'w-full border-b border-input bg-transparent py-2 text-foreground-secondary transition-colors placeholder:text-placeholder disabled:cursor-not-allowed disabled:opacity-60 aria-invalid:border-destructive',
					className
				)}
			/>
			{error && (
				<p id={errorId} className="mt-1 text-sm text-destructive">
					{error}
				</p>
			)}
			{hint && (
				<div id={hintId} className="mt-2">
					{hint}
				</div>
			)}
		</div>
	);
}
