import { Unsubscribable } from 'rxjs';
import { ConnectLine, Element } from '@maklja/vision-simulator-model';
import { createSimulationModel, ObservableSimulation } from './ObservableSimulation';
import { FlowValueEvent } from './context';
import {
	InvalidElementPropertyValueError,
	MissingNextElementError,
	MissingReferenceObservableError,
	UnsupportedElementTypeError,
} from './errors';

export enum ObservableSimulationMessageType {
	StartSimulation = 'startSimulation',
	StopSimulation = 'stopSimulation',
	Next = 'next',
	Error = 'error',
	Complete = 'complete',
	CreationError = 'creationError',
}

interface ResultMessageEvent {
	type:
		| ObservableSimulationMessageType.Next
		| ObservableSimulationMessageType.Error
		| ObservableSimulationMessageType.CreationError;
	value: FlowValueEvent;
}

interface CompleteMessageEvent {
	type: ObservableSimulationMessageType.Complete;
}

type FlowValueMessageEvent = ResultMessageEvent | CompleteMessageEvent;

export interface CreationErrorEvent {
	elementId: string;
	errorMessage: string;
	errorId: string;
}

export interface CreateObservableSimulationProps {
	entryElementId: string;
	elements: Element[];
	connectLines: ConnectLine[];
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
	onCreationError,
}: CreateObservableSimulationProps): Unsubscribable {
	if (window.Worker) {
		const backgroundWorker = new Worker(
			new URL('./observableSimulationWorker.ts', import.meta.url),
			{ name: 'ObservableWorker', type: 'module' },
		);

		backgroundWorker.addEventListener('message', (ev: MessageEvent<FlowValueMessageEvent>) => {
			const { data } = ev;

			switch (data.type) {
				case ObservableSimulationMessageType.Next:
					return onNext?.(data.value);
				case ObservableSimulationMessageType.Error:
					return onError?.(data.value);
				case ObservableSimulationMessageType.Complete:
					return onComplete?.();
				case ObservableSimulationMessageType.CreationError:
					return onCreationError?.({
						elementId: data.value.sourceElementId,
						errorId: data.value.id,
						errorMessage: data.value.value,
					});
			}
		});

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
				backgroundWorker.postMessage({
					type: ObservableSimulationMessageType.StopSimulation,
				});
				backgroundWorker.terminate();
			},
		};
	}

	try {
		const observableSimulation = new ObservableSimulation(
			createSimulationModel(entryElementId, elements, connectLines),
		);

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
				elementId: e.elementId,
				errorMessage: e.message,
				errorId: e.id,
			});
		}

		throw e;
	}
}

