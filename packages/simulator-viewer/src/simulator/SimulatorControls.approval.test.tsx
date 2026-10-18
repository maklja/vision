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

vi.mock('@maklja/vision-simulator-engine', async (importOriginal) => {
	await engine.ready;
	return {
		...(await importOriginal<typeof import('@maklja/vision-simulator-engine')>()),
		startObservableSimulation: engine.start,
	};
});
vi.mock('../ui', () => ({
	SimulationControls: (props: SimulationControlsProps) => (
		<>
			<button onClick={() => props.onEntryElementChange?.('source')}>
				Select imported pipeline
			</button>
			<button
				disabled={!props.executionAllowed}
				onClick={() => props.onSimulationStart?.('source', 'test-run')}
			>
				Start imported pipeline
			</button>
		</>
	),
}));
afterEach(cleanup);

it('blocks pending validation and discards a start if another source revision is approved before dispatch', async () => {
	const store = createRootStore(currentReleaseDiagram);
	render(
		<StoreContext.Provider value={store}>
			<DiagramExecutionGate store={store} imported>
				<SimulatorControls stage={null} />
			</DiagramExecutionGate>
		</StoreContext.Provider>,
	);
	fireEvent.click(screen.getByRole('button', { name: 'Select imported pipeline' }));
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
	const start = () => screen.getByRole('button', { name: 'Start imported pipeline' });
	await waitFor(() => expect(start().hasAttribute('disabled')).toBe(false));
	fireEvent.click(start());
	act(() =>
		store.getState().updateElementProperty({
			id: 'source',
			propertyName: 'argsFactoryExpression',
			propertyValue: '() => [100]',
		}),
	);
	fireEvent.click(screen.getByRole('button', { name: 'Allow execution for this revision' }));
	await act(async () => {
		await Promise.resolve();
	});
	// A true permission for a different revision must not authorize the suspended old request.
	expect(engine.start).not.toHaveBeenCalled();
	await waitFor(() => expect(start().hasAttribute('disabled')).toBe(false));

	engine.start.mockReturnValue({ unsubscribe: vi.fn() });
	fireEvent.click(screen.getByRole('button', { name: 'Start imported pipeline' }));
	await waitFor(() => expect(engine.start).toHaveBeenCalledOnce());
	expect(engine.start.mock.calls[0][0].elements[0].properties.argsFactoryExpression).toBe(
		'() => [100]',
	);
});
