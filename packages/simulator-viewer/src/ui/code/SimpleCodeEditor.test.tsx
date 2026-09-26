// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SimpleCodeEditor } from './SimpleCodeEditor';

function borderBox(editor: HTMLElement) {
	return editor.closest('div[tabindex="0"]')?.firstElementChild as HTMLElement;
}

afterEach(() => {
	cleanup();
});

describe('SimpleCodeEditor', () => {
	it('renders the label, helper text and the initial code', () => {
		render(
			<SimpleCodeEditor
				label="Project"
				code="x => x"
				helperText="The function to apply."
				language="typescript"
				height="120px"
			/>,
		);

		expect(screen.getByText('Project')).toBeDefined();
		expect(screen.getByText('The function to apply.')).toBeDefined();

		const editor = screen.getByTestId('monaco-editor') as HTMLTextAreaElement;
		expect(editor.value).toBe('x => x');
		expect(editor.getAttribute('data-language')).toBe('typescript');
		expect(editor.getAttribute('data-height')).toBe('120px');
		expect(editor.getAttribute('data-read-only')).toBe('false');
	});

	it('omits the helper text when none is provided', () => {
		render(<SimpleCodeEditor label="Project" code="x => x" />);

		expect(screen.queryByRole('paragraph')).toBeNull();
	});

	it('reports code changes', () => {
		const onCodeChange = vi.fn();
		render(<SimpleCodeEditor label="Project" code="x => x" onCodeChange={onCodeChange} />);

		fireEvent.change(screen.getByTestId('monaco-editor'), { target: { value: 'x => x + 1' } });

		expect(onCodeChange).toHaveBeenCalledWith('x => x + 1');
	});

	it('reports an empty string when the editor clears its value', () => {
		const onCodeChange = vi.fn();
		render(<SimpleCodeEditor label="Project" code="x => x" onCodeChange={onCodeChange} />);

		fireEvent.change(screen.getByTestId('monaco-editor'), { target: { value: '' } });

		expect(onCodeChange).toHaveBeenCalledWith('');
	});

	it('forwards editor options to the code editor', () => {
		render(<SimpleCodeEditor label="Project" code="x => x" options={{ readOnly: true }} />);

		expect(screen.getByTestId('monaco-editor').getAttribute('data-read-only')).toBe('true');
	});

	it('highlights the border while the editor is focused and on hover', () => {
		render(<SimpleCodeEditor label="Project" code="x => x" />);

		const editor = screen.getByTestId('monaco-editor');
		const container = editor.closest('div[tabindex="0"]') as HTMLElement;
		const border = borderBox(editor);

		const restingBorder = getComputedStyle(border).borderColor;
		expect(restingBorder).not.toBe('');

		fireEvent.mouseEnter(container);
		expect(getComputedStyle(border).borderColor).not.toBe(restingBorder);

		fireEvent.mouseLeave(container);
		expect(getComputedStyle(border).borderColor).toBe(restingBorder);

		fireEvent.focus(container);
		const focusedBorder = getComputedStyle(border).borderColor;
		expect(focusedBorder).not.toBe(restingBorder);

		fireEvent.blur(container);
		expect(getComputedStyle(border).borderColor).toBe(restingBorder);
	});
});
