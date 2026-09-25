import { describe, expect, it } from 'vitest';
import {
	ConnectLine,
	ConnectPointPosition,
	ConnectPointType,
	Element,
	ElementProps,
	ElementType,
	FlowValueType,
} from '@maklja/vision-simulator-model';
import { createSimulationModel } from '../ObservableSimulation';
import { FlowValue, FlowValueEvent, SimulationModel } from '../context';
import { DefaultFlowManager } from './DefaultFlowManager';

function element(id: string, type: ElementType, properties: ElementProps = {}): Element {
	return { id, type, name: id, x: 0, y: 0, visible: true, properties };
}

function connectLine(id: string, sourceId: string, targetId: string, index = 0): ConnectLine {
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

function createSimulationModelFixture(): SimulationModel {
	const source = element('source', ElementType.Of, {
		argsFactoryExpression: 'function argsFactory() { return [1, 2, 3]; }',
	});
	const pipe = element('pipe', ElementType.Map, {
		projectExpression: 'function project(value) { return value; }',
	});
	const subscriber = element('subscriber', ElementType.Subscriber);

	return createSimulationModel(
		source.id,
		[source, pipe, subscriber],
		[
			connectLine('source-pipe', 'source', 'pipe'),
			connectLine('pipe-subscriber', 'pipe', 'subscriber'),
		],
	);
}

function createErrorHandlerSimulationModel(): SimulationModel {
	const source = element('source', ElementType.Of, {
		argsFactoryExpression: 'function argsFactory() { return [1, 2, 3]; }',
	});
	const catchError = element('catchError', ElementType.CatchError, {
		selectorExpression: 'function selector() { return createObservable(); }',
	});
	const subscriber = element('subscriber', ElementType.Subscriber);

	return createSimulationModel(
		source.id,
		[source, catchError, subscriber],
		[
			connectLine('source-catch', 'source', 'catchError'),
			connectLine('catch-subscriber', 'catchError', 'subscriber'),
		],
	);
}

describe('DefaultFlowManager', () => {
	it('should buffer flow paths and emit a Next event when reaching a non-ErrorHandler target', () => {
		const simulationModel = createSimulationModelFixture();
		const flowManager = new DefaultFlowManager(simulationModel);
		const events: FlowValueEvent[] = [];
		flowManager.asObservable().subscribe((event) => events.push(event));

		const flowValue = FlowValue.createNextEvent({ value: 7, elementId: 'source' });
		flowManager.handleNextEvent(flowValue, simulationModel.getConnectLine('source-pipe'));
		flowManager.handleNextEvent(flowValue, simulationModel.getConnectLine('pipe-subscriber'));

		expect(events).toHaveLength(2);
		expect(events[0]).toMatchObject({
			id: flowValue.id,
			type: FlowValueType.Next,
			value: '7',
			index: 1,
			connectLinesId: ['source-pipe'],
			sourceElementId: 'source',
			targetElementId: 'pipe',
		});
		expect(events[1]).toMatchObject({
			type: FlowValueType.Next,
			value: '7',
			index: 2,
			connectLinesId: ['pipe-subscriber'],
			sourceElementId: 'pipe',
			targetElementId: 'subscriber',
		});
	});

	it('should emit a Next event for errors when the target is an ErrorHandler or Subscriber', () => {
		const simulationModel = createErrorHandlerSimulationModel();
		const flowManager = new DefaultFlowManager(simulationModel);
		const events: FlowValueEvent[] = [];
		flowManager.asObservable().subscribe((event) => events.push(event));

		flowManager.handleError(
			FlowValue.createErrorEvent(new Error('boom'), 'source'),
			simulationModel.getConnectLine('source-catch'),
		);
		flowManager.handleError(
			FlowValue.createErrorEvent(new Error('boom'), 'catchError'),
			simulationModel.getConnectLine('catch-subscriber'),
		);

		expect(events).toHaveLength(2);
		expect(events[0]).toMatchObject({
			type: FlowValueType.Error,
			value: 'Error: boom',
			index: 1,
			connectLinesId: ['source-catch'],
			sourceElementId: 'source',
			targetElementId: 'catchError',
		});
		expect(events[1]).toMatchObject({
			type: FlowValueType.Error,
			index: 2,
			connectLinesId: ['catch-subscriber'],
			sourceElementId: 'catchError',
			targetElementId: 'subscriber',
		});
	});

	it('should ignore error events when the target is neither an ErrorHandler nor a Subscriber', () => {
		const simulationModel = createSimulationModelFixture();
		const flowManager = new DefaultFlowManager(simulationModel);
		const events: FlowValueEvent[] = [];
		flowManager.asObservable().subscribe((event) => events.push(event));

		flowManager.handleError(
			FlowValue.createErrorEvent(new Error('boom'), 'source'),
			simulationModel.getConnectLine('source-pipe'),
		);

		expect(events).toHaveLength(0);
	});

	it('should correctly propagate and map FlowValue identity, subscribeId, and dependencies to the emitted event', () => {
		const simulationModel = createSimulationModelFixture();
		const flowManager = new DefaultFlowManager(simulationModel);
		const events: FlowValueEvent[] = [];
		flowManager.asObservable().subscribe((event) => events.push(event));

		const flowValue = new FlowValue(
			42,
			'source',
			FlowValueType.Next,
			'flow-id',
			'subscribe-id',
			['dependency-1', 'dependency-2'],
		);
		flowManager.handleNextEvent(flowValue, simulationModel.getConnectLine('source-pipe'));

		expect(events).toHaveLength(1);
		expect(events[0]).toMatchObject({
			id: 'flow-id',
			subscribeId: 'subscribe-id',
			dependencies: ['dependency-1', 'dependency-2'],
			hash: flowValue.hash,
			type: FlowValueType.Next,
			value: '42',
		});
	});

	it('should correctly call eventObserver.error on handleFatalError', () => {
		const simulationModel = createSimulationModelFixture();
		const flowManager = new DefaultFlowManager(simulationModel);
		const errors: (FlowValueEvent | FlowValue)[] = [];
		let completed = false;
		flowManager.asObservable().subscribe({
			error: (error) => errors.push(error),
			complete: () => {
				completed = true;
			},
		});

		const flowValue = new FlowValue('boom', 'source', FlowValueType.Error, 'fatal-id');
		flowManager.handleFatalError(flowValue, simulationModel.getConnectLine('source-pipe'));

		expect(errors).toHaveLength(1);
		const errorEvent = errors[0] as FlowValueEvent & { value: FlowValue };
		expect(errorEvent).toMatchObject({
			id: 'fatal-id',
			index: 1,
			hash: flowValue.hash,
			connectLinesId: ['source-pipe'],
			sourceElementId: 'source',
			targetElementId: 'pipe',
		});
		expect(errorEvent.value).toBeInstanceOf(FlowValue);
		expect(completed).toBe(false);
	});

	it('should properly complete the internal eventObserver on handleComplete', () => {
		const simulationModel = createSimulationModelFixture();
		const flowManager = new DefaultFlowManager(simulationModel);
		let completed = false;
		flowManager.asObservable().subscribe({
			complete: () => {
				completed = true;
			},
		});

		flowManager.handleComplete();

		expect(completed).toBe(true);
	});
});
