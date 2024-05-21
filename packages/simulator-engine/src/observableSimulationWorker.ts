import { ConnectLine, Element, FlowValueType } from '@maklja/vision-simulator-model';
import { createSimulationModel, ObservableSimulation } from './ObservableSimulation';
import { ObservableSimulationMessageType } from './startObservableSimulation';
import {
	InvalidElementPropertyValueError,
	MissingNextElementError,
	MissingReferenceObservableError,
	UnsupportedElementTypeError,
} from './errors';

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
self.addEventListener(
	'message',
	function (this: WindowEventHandlers, ev: MessageEvent<ObservableSimulationMessages>) {
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
				next: (value) =>
					self.postMessage({
						type: ObservableSimulationMessageType.Next,
						value,
					}),
				error: (error) =>
					self.postMessage({
						type: ObservableSimulationMessageType.Error,
						value: error,
					}),
				complete: () =>
					self.postMessage({
						type: ObservableSimulationMessageType.Complete,
					}),
			});
		} catch (e) {
			if (
				e instanceof MissingReferenceObservableError ||
				e instanceof MissingNextElementError ||
				e instanceof UnsupportedElementTypeError ||
				e instanceof InvalidElementPropertyValueError
			) {
				self.postMessage({
					type: ObservableSimulationMessageType.CreationError,
					value: {
						id: e.id,
						sourceElementId: e.elementId,
						targetElementId: e.elementId,
						connectLinesId: [],
						hash: '',
						index: -1,
						type: FlowValueType.Error,
						value: e.message,
						subscribeId: null,
					},
				});
			}

			throw e;
		}
	},
);

