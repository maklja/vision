// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ElementType } from '@maklja/vision-simulator-model';
import { createElement } from '../test-utils';
import { SimulationState } from '../store/simulation';
import { SimulationControls } from './SimulationControls';

const ofElement = createElement(ElementType.Of, { id: 'of-1', name: 'Beta' });
const intervalElement = createElement(ElementType.Interval, { id: 'interval-1', name: 'Alpha' });
const mapElement = createElement(ElementType.Map, { id: 'map-1', name: 'Gamma' });

function renderControls(overrides: Partial<Parameters<typeof SimulationControls>[0]> = {}) {
	const props = {
		simulatorId: 'simulator-1',
		simulationState: SimulationState.Stopped,
		entryElements: [intervalElement, ofElement],
		simulationResults: [],
		onSimulationStart: vi.fn(),
		onSimulationStop: vi.fn(),
		onSimulationReset: vi.fn(),
		onElementLocate: vi.fn(),
		...overrides,
	};
	render(<SimulationControls {...props} />);
	return props;
}

function openEntryOptions() {
	fireEvent.mouseDown(screen.getByRole('combobox'));
	return screen.getAllByRole('option');
}

function selectEntryOption(name: string) {
	const option = openEntryOptions().find((el) => el.textContent?.includes(name));
	expect(option).toBeDefined();
	fireEvent.click(option as HTMLElement);
}

describe('SimulationControls', () => {
	afterEach(() => {
		cleanup();
	});

	it('renders only the provided entry operators as autocomplete options', () => {
		renderControls();

		const optionTexts = openEntryOptions().map((option) => option.textContent);

		expect(optionTexts).toEqual(['interval - Alpha', 'of - Beta']);
		expect(optionTexts.join(' ')).not.toContain(mapElement.name);
	});

	it('keeps start disabled until an entry operator is selected', () => {
		const props = renderControls();

		const startButton = screen.getByRole('button', { name: 'start simulation' }) as HTMLButtonElement;
		expect(startButton.disabled).toBe(true);

		fireEvent.click(startButton);
		expect(props.onSimulationStart).not.toHaveBeenCalled();

		selectEntryOption('of - Beta');
		expect(startButton.disabled).toBe(false);
	});

	it('starts the selected entry operator through the callback contract', () => {
		const props = renderControls();

		selectEntryOption('interval - Alpha');
		fireEvent.click(screen.getByRole('button', { name: 'start simulation' }));

		expect(props.onSimulationStart).toHaveBeenCalledTimes(1);
		expect(props.onSimulationStart).toHaveBeenCalledWith(intervalElement.id, props.simulatorId);
	});

	it('shows start only while stopped and reset only while running', () => {
		const { unmount } = render(<SimulationControls
			simulatorId="simulator-1"
			simulationState={SimulationState.Stopped}
			entryElements={[ofElement]}
			onSimulationStart={vi.fn()}
		/>);

		expect(screen.queryByRole('button', { name: 'start simulation' })).not.toBeNull();
		expect(screen.queryByRole('button', { name: 'reset simulation' })).toBeNull();
		expect((screen.getByRole('button', { name: 'stop simulation' }) as HTMLButtonElement).disabled).toBe(
			true,
		);
		unmount();

		render(
			<SimulationControls
				simulatorId="simulator-1"
				simulationState={SimulationState.Running}
				entryElements={[ofElement]}
				onSimulationStart={vi.fn()}
			/>,
		);

		expect(screen.queryByRole('button', { name: 'start simulation' })).toBeNull();
		expect(screen.queryByRole('button', { name: 'reset simulation' })).not.toBeNull();
		expect((screen.getByRole('button', { name: 'stop simulation' }) as HTMLButtonElement).disabled).toBe(
			false,
		);
	});

	it('forwards the selected entry operator when stopping and resetting a running simulation', () => {
		const props = renderControls({ simulationState: SimulationState.Running });

		selectEntryOption('of - Beta');
		fireEvent.click(screen.getByRole('button', { name: 'stop simulation' }));
		expect(props.onSimulationStop).toHaveBeenCalledWith(ofElement.id, props.simulatorId);

		fireEvent.click(screen.getByRole('button', { name: 'reset simulation' }));
		expect(props.onSimulationReset).toHaveBeenCalledWith(ofElement.id, props.simulatorId);
	});

	it('exposes simulation results as a polite accessible output', () => {
		renderControls({ simulationResults: ['1', '2'] });

		const output = screen.getByLabelText('simulation results');
		expect(output.textContent).toBe('1, 2');
		expect(output.getAttribute('aria-live')).toBe('polite');
	});

	it('forwards the located element without changing the autocomplete selection', () => {
		const props = renderControls();

		const betaOption = openEntryOptions().find((option) => option.textContent?.includes('of - Beta'));
		const locateButton = within(betaOption as HTMLElement).getByRole('button');
		fireEvent.click(locateButton);

		expect(props.onElementLocate).toHaveBeenCalledTimes(1);
		expect(props.onElementLocate).toHaveBeenCalledWith(ofElement);
		expect(screen.getByRole('combobox').getAttribute('value')).toBeFalsy();
		expect(
			(screen.getByRole('button', { name: 'start simulation' }) as HTMLButtonElement).disabled,
		).toBe(true);
	});

	it('does not locate elements when no callback is provided', () => {
		renderControls({ onElementLocate: undefined });

		const betaOption = openEntryOptions().find((option) => option.textContent?.includes('of - Beta'));
		expect(() =>
			fireEvent.click(within(betaOption as HTMLElement).getByRole('button')),
		).not.toThrow();
	});
});
