import { ConnectLine, Element, FlowValueType } from '@maklja/vision-simulator-model';
import { createSimulationModel, ObservableSimulation } from './ObservableSimulation';
import { ObservableSimulationMessageType } from './startObservableSimulation';
import {
	InvalidElementPropertyValueError,
	MissingNextElementError,
	MissingReferenceObservableError,
	UnsupportedElementTypeError,
} from './errors';
import { FlowValueEvent } from './context';

export interface StartSimulationMessageEvent {
	type: ObservableSimulationMessageType.StartSimulation;
	entryElementId: string;
	elements: Element[];
	connectLines: ConnectLine[];
}

export interface StopSimulationMessageEvent {
	type: ObservableSimulationMessageType.StopSimulation;
}

export type ObservableSimulationMessages = StartSimulationMessageEvent | StopSimulationMessageEvent;

let observableSimulation: ObservableSimulation | null;
self.onmessage = function (
	this: WindowEventHandlers,
	ev: MessageEvent<ObservableSimulationMessages>,
) {
	if (!ev.isTrusted) {
		return;
	}

	if (ev.data.type === ObservableSimulationMessageType.StopSimulation) {
		observableSimulation?.stop();
		observableSimulation = null;
		return;
	}

	if (observableSimulation) {
		return;
	}

	try {
		const createSimulationMessage = ev.data;
		observableSimulation = new ObservableSimulation(
			createSimulationModel(
				createSimulationMessage.entryElementId,
				createSimulationMessage.elements,
				createSimulationMessage.connectLines,
			),
		);

		observableSimulation.start({
			next: (value) => self.postMessage(value),
			error: (error) => self.postMessage(error),
			complete: () => self.postMessage(null),
		});
	} catch (e) {
		if (
			e instanceof MissingReferenceObservableError ||
			e instanceof MissingNextElementError ||
			e instanceof UnsupportedElementTypeError ||
			e instanceof InvalidElementPropertyValueError
		) {
			const event: FlowValueEvent = {
				id: e.id,
				sourceElementId: e.elementId,
				targetElementId: e.elementId,
				connectLinesId: [],
				hash: '',
				index: -1,
				type: FlowValueType.CreationError,
				value: e.message,
			};
			self.postMessage(event);
		}

		throw e;
	}
};
