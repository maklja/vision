// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CatchErrorElementPropertiesForm } from './CatchErrorElementPropertiesForm';

afterEach(() => {
	cleanup();
});

describe('CatchErrorElementPropertiesForm', () => {
	it('renders the selector expression and reports changes', () => {
		const onPropertyValueChange = vi.fn();
		render(
			<CatchErrorElementPropertiesForm
				id="catch-1"
				properties={{ selectorExpression: '(error, caught) => caught' }}
				onPropertyValueChange={onPropertyValueChange}
			/>,
		);

		expect(screen.getAllByText('Project').length).toBeGreaterThan(0);
		const editor = screen.getByTestId('monaco-editor') as HTMLTextAreaElement;
		expect(editor.value).toBe('(error, caught) => caught');

		fireEvent.change(editor, { target: { value: '(error, caught) => of(0)' } });

		expect(onPropertyValueChange).toHaveBeenCalledWith(
			'catch-1',
			'selectorExpression',
			'(error, caught) => of(0)',
		);
	});
});
