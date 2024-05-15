import { Unsubscribable } from 'rxjs';
import { ConnectLine, Element, FlowValueType } from '@maklja/vision-simulator-model';
import { createSimulationModel, ObservableSimulation } from './ObservableSimulation';
import { FlowValueEvent } from './context';
import {
	InvalidElementPropertyValueError,
	MissingNextElementError,
	MissingReferenceObservableError,
	UnsupportedElementTypeError,
} from './errors';
import { GraphBranch } from './simulationGraph';

export enum ObservableSimulationMessageType {
	StartSimulation = 'startSimulation',
	StopSimulation = 'stopSimulation',
	Creation = 'creation',
	CreationError = 'creationError',
	Event = 'event',
}

export interface CreationErrorEvent {
	type: ObservableSimulationMessageType.CreationError;
	elementId: string;
	errorMessage: string;
	errorId: string;
}

export interface CreationEvent {
	type: ObservableSimulationMessageType.Creation;
	entryElementId: string;
	observableGraphBranch: Record<string, GraphBranch>;
}

export interface SimulationEvent {
	type: ObservableSimulationMessageType.Event;
	event: FlowValueEvent | null;
}

export type ObservableSimulationMessages = CreationEvent | CreationErrorEvent | SimulationEvent;

export interface CreateObservableSimulationProps {
	entryElementId: string;
	elements: Element[];
	connectLines: ConnectLine[];
	onCreation?: (simulationModelEvent: CreationEvent) => void;
	onCreationError?: (creationErrorEvent: CreationErrorEvent) => void;
	onNext?: (value: FlowValueEvent) => void;
	onError?: (value: FlowValueEvent) => void;
	onComplete?: () => void;
}

export function startObservableSimulation({
	entryElementId,
	elements,
	connectLines,
	onNext,
	onError,
	onComplete,
	onCreation,
	onCreationError,
}: CreateObservableSimulationProps): Unsubscribable {
	if (window.Worker) {
		const backgroundWorker = new Worker(
			new URL('./observableSimulationWorker.ts', import.meta.url),
			{ name: 'ObservableWorker', type: 'module' },
		);

		backgroundWorker.addEventListener(
			'message',
			(ev: MessageEvent<ObservableSimulationMessages>) => {
				const { data } = ev;

				if (data.type === ObservableSimulationMessageType.Creation) {
					return onCreation?.(data);
				} else if (data.type === ObservableSimulationMessageType.CreationError) {
					return onCreationError?.(data);
				} else if (data.type === ObservableSimulationMessageType.Event) {
					const { event } = data;
					if (event === null) {
						return onComplete?.();
					}

					switch (event.type) {
						case FlowValueType.Next:
							return onNext?.(event);
						case FlowValueType.Error:
							return onError?.(event);
					}
				}
			},
		);

		backgroundWorker.addEventListener('error', (ev) => {
			console.error('Error is throw by ObservableWorker', ev);
			backgroundWorker.terminate();
		});

		backgroundWorker.addEventListener('messageerror', (ev) => {
			console.error('Message error is thrown by ObservableWorker', ev.data);
		});

		backgroundWorker.postMessage({
			type: ObservableSimulationMessageType.StartSimulation,
			entryElementId,
			elements,
			connectLines,
		});

		return {
			unsubscribe() {
				backgroundWorker.terminate();
			},
		};
	}

	try {
		const simModel = createSimulationModel(entryElementId, elements, connectLines);
		const observableSimulation = new ObservableSimulation(simModel);

		onCreation?.({
			type: ObservableSimulationMessageType.Creation,
			entryElementId: simModel.entryElementId,
			observableGraphBranch: Object.fromEntries(simModel.graphBranches.entries()),
		});
		return observableSimulation.start({
			next: (value) => onNext?.(value),
			error: (error) => onError?.(error),
			complete: () => onComplete?.(),
		});
	} catch (e) {
		if (
			e instanceof MissingReferenceObservableError ||
			e instanceof MissingNextElementError ||
			e instanceof UnsupportedElementTypeError ||
			e instanceof InvalidElementPropertyValueError
		) {
			onCreationError?.({
				type: ObservableSimulationMessageType.CreationError,
				elementId: e.elementId,
				errorMessage: e.message,
				errorId: e.id,
			});
		}

		throw e;
	}
}

