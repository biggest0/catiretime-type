import { useId, type ComponentProps } from 'react';

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
}

/**
 * One line of a form: a label, a text input and, when there is one, the
 * field's error message. The three are tied together, so a click on the
 * label focuses the input, and a screen reader on the input reads the label,
 * that the value is invalid, and the message.
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
 * @param props.className - Extra classes for the input, merged last.
 * @returns The label, the input and the error.
 */
export function TextField({
	label,
	error,
	className,
	...inputProps
}: TextFieldProps) {
	// unique on the page, so two forms (or two fields) never share an id
	const id = useId();
	const errorId = `${id}-error`;

	return (
		<div>
			<label htmlFor={id} className="mb-1 block text-sm text-muted-foreground">
				{label}
			</label>
			<input
				{...inputProps}
				id={id}
				// both only while there is an error: `aria-invalid="false"`
				// and a description pointing at nothing help nobody
				aria-invalid={error ? true : undefined}
				aria-describedby={error ? errorId : undefined}
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
		</div>
	);
}
