import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import type { SimulationControlsProps } from '../ui/SimulationControls';
import { currentReleaseDiagram } from '../../../simulator-model/test/fixtures/currentReleaseDiagram';
import { createRootStore, StoreContext } from '../store/rootStore';
import { DiagramExecutionGate } from '../persistence/DiagramExecutionGate';
import { SimulatorControls } from './SimulatorControls';

const engine = vi.hoisted(() => {
	let release!: () => void;
	const ready = new Promise<void>((resolve) => {
		release = resolve;
	});
	return { ready, release, start: vi.fn() };
});

vi.mock('@maklja/vision-simulator-engine', async () => {
	await engine.ready;
	return { startObservableSimulation: engine.start };
});
vi.mock('../ui', () => ({
	SimulationControls: (props: SimulationControlsProps) => (
		<button
			disabled={!props.executionAllowed}
			onClick={() => props.onSimulationStart?.('source', 'test-run')}
		>
			Start imported pipeline
		</button>
	),
}));
afterEach(cleanup);

it('discards a pending start if another source revision is approved while the engine chunk loads', async () => {
	const store = createRootStore(currentReleaseDiagram);
	render(
		<StoreContext.Provider value={store}>
			<DiagramExecutionGate store={store} imported>
				<SimulatorControls stage={null} />
			</DiagramExecutionGate>
		</StoreContext.Provider>,
	);
	fireEvent.click(screen.getByRole('button', { name: 'Allow execution for this revision' }));
	fireEvent.click(screen.getByRole('button', { name: 'Start imported pipeline' }));
	expect(engine.start).not.toHaveBeenCalled();
	act(() =>
		store.getState().updateElementProperty({
			id: 'source',
			propertyName: 'argsFactoryExpression',
			propertyValue: '() => [99]',
		}),
	);
	expect(
		screen.getByRole('button', { name: 'Start imported pipeline' }).hasAttribute('disabled'),
	).toBe(true);
	fireEvent.click(screen.getByRole('button', { name: 'Allow execution for this revision' }));
	await act(async () => {
		engine.release();
		await engine.ready;
	});
	// A true permission for a different revision must not authorize the suspended old request.
	await waitFor(() => expect(engine.start).not.toHaveBeenCalled());

	engine.start.mockReturnValue({ unsubscribe: vi.fn() });
	fireEvent.click(screen.getByRole('button', { name: 'Start imported pipeline' }));
	await waitFor(() => expect(engine.start).toHaveBeenCalledOnce());
	expect(engine.start.mock.calls[0][0].elements[0].properties.argsFactoryExpression).toBe(
		'() => [99]',
	);
});
