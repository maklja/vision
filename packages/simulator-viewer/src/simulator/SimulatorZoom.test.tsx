// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createStoreWrapper, createTestStore } from '../test-utils';
import { SimulatorZoom } from './SimulatorZoom';

type StageProp = Parameters<typeof SimulatorZoom>[0]['stage'];

function createStageMock() {
	const state = { scale: 1, x: 0, y: 0 };
	const stage = {
		width: () => 800,
		height: () => 600,
		scaleX: () => state.scale,
		scaleY: () => state.scale,
		x: () => state.x,
		y: () => state.y,
		scale: vi.fn((scale?: { x: number; y: number }) => {
			if (scale) {
				state.scale = scale.x;
			}
			return { x: state.scale, y: state.scale };
		}),
		position: vi.fn((position?: { x: number; y: number }) => {
			if (position) {
				state.x = position.x;
				state.y = position.y;
			}
			return { x: state.x, y: state.y };
		}),
	} as unknown as NonNullable<StageProp>;

	return { stage, state };
}

function renderZoom(stage: StageProp) {
	const store = createTestStore();
	const Wrapper = createStoreWrapper(store);
	render(
		<Wrapper>
			<SimulatorZoom stage={stage} />
		</Wrapper>,
	);
	return store;
}

afterEach(() => {
	cleanup();
});

describe('SimulatorZoom', () => {
	it('zooms in around the stage center and stores the canvas state', () => {
		const { stage } = createStageMock();
		const store = renderZoom(stage);

		fireEvent.click(screen.getByRole('button', { name: 'zoom in' }));

		expect(stage.scale).toHaveBeenCalledWith({ x: 2.01, y: 2.01 });
		const position = (stage.position as unknown as { mock: { calls: { x: number; y: number }[][] } })
			.mock.calls[0][0];
		expect(position.x).toBeCloseTo(-404);
		expect(position.y).toBeCloseTo(-303);
		expect(store.getState().canvasState.scaleX).toBeCloseTo(2.01);
		expect(store.getState().canvasState.x).toBeCloseTo(-404);
		expect(store.getState().canvasState.y).toBeCloseTo(-303);
	});

	it('zooms out around the stage center and stores the canvas state', () => {
		const { stage } = createStageMock();
		const store = renderZoom(stage);

		fireEvent.click(screen.getByRole('button', { name: 'zoom out' }));

		expect(stage.scale).toHaveBeenCalledWith({ x: 1 / 2.01, y: 1 / 2.01 });
		expect(store.getState().canvasState.scaleX).toBeCloseTo(1 / 2.01);
	});

	it('ignores zoom requests without a stage', () => {
		const store = renderZoom(null);

		expect(() => fireEvent.click(screen.getByRole('button', { name: 'zoom in' }))).not.toThrow();
		expect(store.getState().canvasState.scaleX).toBe(1);
	});
});
