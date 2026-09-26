import { createElement, forwardRef, PropsWithChildren } from 'react';
import { beforeEach, vi } from 'vitest';

const deterministicUuid = vi.hoisted(() => ({ counter: 0 }));

// Store slices generate identifiers with `uuid`'s v1. Characterizing resulting state requires
// those identifiers to be stable so tests stay deterministic and do not depend on the clock.
vi.mock('uuid', () => ({
	v1: () => `00000000-0000-4000-8000-${String(++deterministicUuid.counter).padStart(12, '0')}`,
}));

// Konva requires a canvas implementation that jsdom does not provide. The characterization suite
// asserts accessible controls and store state instead of canvas pixels, so every react-konva
// element is replaced with an inert DOM stand-in that keeps its children.
vi.mock('react-konva', () => {
	function KonvaMock({ children, ...props }: PropsWithChildren<Record<string, unknown>>) {
		return createElement('div', props, children as never);
	}
	function NoopMock(props: Record<string, unknown>) {
		return createElement('div', { 'data-konva': 'noop', ...props });
	}

	const RefMock = forwardRef<unknown, PropsWithChildren<Record<string, unknown>>>(
		function RefMock({ children, ...props }) {
			return createElement('div', props, children as never);
		},
	);

	return {
		Stage: KonvaMock,
		Layer: KonvaMock,
		Group: KonvaMock,
		Label: KonvaMock,
		Tag: KonvaMock,
		Rect: NoopMock,
		Circle: NoopMock,
		Ellipse: NoopMock,
		Ring: NoopMock,
		Star: NoopMock,
		Arc: NoopMock,
		Line: NoopMock,
		Arrow: NoopMock,
		Path: NoopMock,
		Text: RefMock,
		Image: NoopMock,
		Transformer: NoopMock,
	};
});

// Monaco cannot mount in jsdom. The lightweight double keeps the code value and change callback
// observable through a real textarea so property forms can be characterized without the editor.
vi.mock('@monaco-editor/react', async () => {
	const { createElement, useMemo } = await import('react');

	const Editor = (props: {
		defaultValue?: string;
		defaultLanguage?: string;
		height?: string | number;
		options?: Record<string, unknown>;
		onChange?: (value: string | undefined) => void;
	}) => {
		// Monaco treats `defaultValue` as the initial model value and ignores later changes. The
		// double captures the value on mount so the characterization keeps that behavior.
		const initialValue = useMemo(() => props.defaultValue ?? '', []);

		return createElement('textarea', {
			'data-testid': 'monaco-editor',
			'data-language': props.defaultLanguage ?? '',
			'data-height': String(props.height ?? ''),
			'data-read-only': String(Boolean(props.options?.readOnly)),
			defaultValue: initialValue,
			onChange: (event: { target: { value: string } }) =>
				props.onChange?.(event.target.value),
		});
	};

	return { Editor, default: Editor };
});

beforeEach(() => {
	deterministicUuid.counter = 0;
});
