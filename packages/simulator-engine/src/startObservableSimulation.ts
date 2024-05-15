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

export enum ObservableSimulationMessageType {
	StartSimulation = 'startSimulation',
	StopSimulation = 'stopSimulation',
}

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

		backgroundWorker.addEventListener('message', (ev: MessageEvent<FlowValueEvent | null>) => {
			const { data } = ev;
			if (data === null) {
				return onComplete?.();
			}

			switch (data.type) {
				case FlowValueType.Next:
				case FlowValueType.Subscribe:
					return onNext?.(data);
				case FlowValueType.Error:
					return onError?.(data);
				case FlowValueType.CreationError:
					return onCreationError?.({
						elementId: data.sourceElementId,
						errorId: data.id,
						errorMessage: data.value,
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
