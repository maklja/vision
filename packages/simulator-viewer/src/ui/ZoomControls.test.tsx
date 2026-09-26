// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ZoomControls } from './ZoomControls';

afterEach(() => {
	cleanup();
});

describe('ZoomControls', () => {
	it('renders labelled zoom in and zoom out buttons', () => {
		render(<ZoomControls />);

		expect(screen.getByRole('button', { name: 'zoom in' })).toBeDefined();
		expect(screen.getByRole('button', { name: 'zoom out' })).toBeDefined();
	});

	it('reports zoom in and zoom out clicks', () => {
		const onZoomIn = vi.fn();
		const onZoomOut = vi.fn();
		render(<ZoomControls onZoomIn={onZoomIn} onZoomOut={onZoomOut} />);

		fireEvent.click(screen.getByRole('button', { name: 'zoom in' }));
		fireEvent.click(screen.getByRole('button', { name: 'zoom out' }));

		expect(onZoomIn).toHaveBeenCalledTimes(1);
		expect(onZoomOut).toHaveBeenCalledTimes(1);
	});

	it('does nothing without zoom callbacks', () => {
		render(<ZoomControls />);

		expect(() => {
			fireEvent.click(screen.getByRole('button', { name: 'zoom in' }));
			fireEvent.click(screen.getByRole('button', { name: 'zoom out' }));
		}).not.toThrow();
	});
});
