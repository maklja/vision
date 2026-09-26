// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ElementGroup, mapElementGroupToTypes } from '@maklja/vision-simulator-model';
import { createStoreWrapper, createTestStore } from '../test-utils';
import { SimulationState } from '../store/simulation';
import { StageState } from '../store/stage';
import { SimulatorOperators } from './SimulatorOperators';

vi.mock('react-dnd', () => ({
	useDrag: () => [{ isDragging: false }, () => undefined, () => undefined],
}));

vi.mock('react-dnd-html5-backend', () => ({
	getEmptyImage: () => ({}),
}));

function renderOperators() {
	const store = createTestStore();
	const Wrapper = createStoreWrapper(store);
	render(
		<Wrapper>
			<SimulatorOperators />
		</Wrapper>,
	);
	return store;
}

function popperVisibility() {
	const popper = document.getElementById('operators-popper');
	return popper ? getComputedStyle(popper).visibility : null;
}

afterEach(() => {
	cleanup();
});

describe('SimulatorOperators', () => {
	it('enables the palette and shows the popper while stopped in select state', () => {
		renderOperators();

		const button = screen.getByRole('button', { name: 'creation operators' }) as HTMLButtonElement;
		expect(button.disabled).toBe(false);

		fireEvent.click(button);

		expect(screen.getAllByTestId(/^operator-/)).toHaveLength(
			mapElementGroupToTypes(ElementGroup.Creation).size,
		);
		expect(popperVisibility()).toBe('visible');
	});

	it('disables the palette while a simulation is running', () => {
		const store = renderOperators();
		act(() => {
			store.getState().startSimulation();
		});

		for (const label of ['creation operators', 'subscriber']) {
			expect((screen.getByRole('button', { name: label }) as HTMLButtonElement).disabled).toBe(
				true,
			);
		}
	});

	it('hides the popper while the stage is in an incompatible interaction state', () => {
		const store = renderOperators();
		store.getState().changeState(StageState.Dragging);

		fireEvent.click(screen.getByRole('button', { name: 'creation operators' }));

		expect(popperVisibility()).toBe('collapse');
	});

	it('cannot open the popper while a simulation is running', () => {
		const store = renderOperators();
		act(() => {
			store.getState().startSimulation();
		});
		expect(store.getState().simulation.state).toBe(SimulationState.Running);

		const button = screen.getByRole('button', { name: 'creation operators' }) as HTMLButtonElement;
		fireEvent.click(button);

		expect(button.disabled).toBe(true);
		expect(popperVisibility()).toBeNull();
		expect(screen.queryAllByTestId(/^operator-/)).toHaveLength(0);
	});
});
