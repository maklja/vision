import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
	ConnectLine,
	ConnectPointPosition,
	ConnectPointType,
	Element,
	ElementProps,
	ElementType,
	FlowValueType,
} from '@maklja/vision-simulator-model';
import { ObservableSimulationMessageType } from './startObservableSimulation';

type Listener = (event: unknown) => void;

class FakeWorkerScope {
	readonly postMessage = vi.fn();
	private readonly listeners = new Map<string, Listener[]>();

	addEventListener(type: string, listener: Listener): void {
		const listeners = this.listeners.get(type) ?? [];
		this.listeners.set(type, [...listeners, listener]);
	}

	dispatch(type: string, payload: unknown): void {
		(this.listeners.get(type) ?? []).forEach((listener) => listener(payload));
	}
}

function element(id: string, type: ElementType, properties: ElementProps = {}): Element {
	return { id, type, name: id, x: 0, y: 0, visible: true, properties };
}

function link(id: string, sourceId: string, targetId: string, index = 0): ConnectLine {
	return {
		id,
		source: {
			id: sourceId,
			connectPointType: ConnectPointType.Output,
			connectPosition: ConnectPointPosition.Right,
		},
		target: {
			id: targetId,
			connectPointType: ConnectPointType.Input,
			connectPosition: ConnectPointPosition.Left,
		},
		points: [],
		locked: false,
		index,
		name: '',
	};
}

const source = element('source', ElementType.Of, {
	argsFactoryExpression: 'function argsFactory() { return [1, 2]; }',
});
const subscriber = element('subscriber', ElementType.Subscriber);

function startMessage(): unknown {
	return {
		data: {
			type: ObservableSimulationMessageType.StartSimulation,
			entryElementId: 'source',
			elements: [source, subscriber],
			connectLines: [link('source-subscriber', 'source', 'subscriber')],
		},
	};
}

function sentMessages(scope: FakeWorkerScope): Record<string, unknown>[] {
	return scope.postMessage.mock.calls.map(([message]) => message as Record<string, unknown>);
}

describe('observableSimulationWorker', () => {
	let scope: FakeWorkerScope;

	beforeEach(async () => {
		vi.resetModules();
		scope = new FakeWorkerScope();
		vi.stubGlobal('self', scope);
		await import('./observableSimulationWorker');
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('should post structured-cloned Next and Complete messages for a valid graph', () => {
		scope.dispatch('message', startMessage());

		const messages = sentMessages(scope);
		expect(messages.map((message) => message.type)).toEqual([
			ObservableSimulationMessageType.Next,
			ObservableSimulationMessageType.Next,
			ObservableSimulationMessageType.Complete,
		]);
		expect(messages[0].value).toMatchObject({
			type: FlowValueType.Next,
			value: '1',
			index: 1,
			connectLinesId: ['source-subscriber'],
			sourceElementId: 'source',
			targetElementId: 'subscriber',
		});
		expect(messages[1].value).toMatchObject({ value: '2', index: 2 });
	});

	it('should ignore a start message while a simulation is already running', () => {
		scope.dispatch('message', startMessage());
		const messagesAfterFirstStart = sentMessages(scope).length;

		scope.dispatch('message', startMessage());

		expect(sentMessages(scope)).toHaveLength(messagesAfterFirstStart);
	});

	it('should stop the running simulation and allow a fresh simulation to start', () => {
		scope.dispatch('message', startMessage());
		const messagesAfterFirstStart = sentMessages(scope).length;

		scope.dispatch('message', {
			data: { type: ObservableSimulationMessageType.StopSimulation },
		});
		scope.dispatch('message', startMessage());

		expect(sentMessages(scope).length).toBe(messagesAfterFirstStart * 2);
	});

	it('should post a CreationError message and rethrow when the graph cannot be simulated', () => {
		const buffer = element('buffer', ElementType.Buffer);

		expect(() =>
			scope.dispatch('message', {
				data: {
					type: ObservableSimulationMessageType.StartSimulation,
					entryElementId: 'source',
					elements: [source, buffer, subscriber],
					connectLines: [
						link('source-buffer', 'source', 'buffer'),
						link('buffer-subscriber', 'buffer', 'subscriber', 1),
					],
				},
			}),
		).toThrow('Reference observable is required for buffer operator');

		const messages = sentMessages(scope);
		expect(messages).toHaveLength(1);
		expect(messages[0]).toMatchObject({
			type: ObservableSimulationMessageType.CreationError,
			value: {
				sourceElementId: 'buffer',
				value: 'Reference observable is required for buffer operator',
			},
		});
	});
});
