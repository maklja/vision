import { describe, expect, it, vi } from 'vitest';
import { handleNumberInputChanged, handleOptionalNumberInputChanged } from './utils';

function changeEvent(value: string) {
	return { target: { value } } as unknown as React.ChangeEvent<
		HTMLInputElement | HTMLTextAreaElement
	>;
}

describe('handleNumberInputChanged', () => {
	it('reports parsed numbers for the property name of the element', () => {
		const onPropertyValueChange = vi.fn();
		const handler = handleNumberInputChanged('of-1', 'startDue', 10, onPropertyValueChange);

		handler(changeEvent('42'));

		expect(onPropertyValueChange).toHaveBeenCalledWith('of-1', 'startDue', 42);
	});

	it('falls back to the default value for unparseable input', () => {
		const onPropertyValueChange = vi.fn();
		const handler = handleNumberInputChanged('of-1', 'startDue', 10, onPropertyValueChange);

		handler(changeEvent('not a number'));

		expect(onPropertyValueChange).toHaveBeenCalledWith('of-1', 'startDue', 10);
	});

	it('treats an empty input as zero', () => {
		const onPropertyValueChange = vi.fn();
		const handler = handleNumberInputChanged('of-1', 'startDue', 10, onPropertyValueChange);

		handler(changeEvent(''));

		expect(onPropertyValueChange).toHaveBeenCalledWith('of-1', 'startDue', 0);
	});

	it('does nothing without a change callback', () => {
		const handler = handleNumberInputChanged('of-1', 'startDue', 10);

		expect(() => handler(changeEvent('1'))).not.toThrow();
	});
});

describe('handleOptionalNumberInputChanged', () => {
	it('clears optional values for an empty input', () => {
		const onPropertyValueChange = vi.fn();
		const handler = handleOptionalNumberInputChanged('of-1', 'count', 5, onPropertyValueChange);

		handler(changeEvent(''));

		expect(onPropertyValueChange).toHaveBeenCalledWith('of-1', 'count', undefined);
	});

	it('reports parsed numbers for a filled optional input', () => {
		const onPropertyValueChange = vi.fn();
		const handler = handleOptionalNumberInputChanged('of-1', 'count', 5, onPropertyValueChange);

		handler(changeEvent('7'));

		expect(onPropertyValueChange).toHaveBeenCalledWith('of-1', 'count', 7);
	});

	it('falls back to the default value for unparseable optional input', () => {
		const onPropertyValueChange = vi.fn();
		const handler = handleOptionalNumberInputChanged('of-1', 'count', 5, onPropertyValueChange);

		handler(changeEvent('abc'));

		expect(onPropertyValueChange).toHaveBeenCalledWith('of-1', 'count', 5);
	});

	it('reports undefined when an unparseable optional input has no default value', () => {
		const onPropertyValueChange = vi.fn();
		const handler = handleOptionalNumberInputChanged('of-1', 'count', undefined, onPropertyValueChange);

		handler(changeEvent('abc'));

		expect(onPropertyValueChange).toHaveBeenCalledWith('of-1', 'count', undefined);
	});
});
