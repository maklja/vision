import { ConnectLine, Element } from '@maklja/vision-simulator-model';
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
			const simModel = createSimulationModel(
				createSimulationMessage.entryElementId,
				createSimulationMessage.elements,
				createSimulationMessage.connectLines,
			);
			observableSimulation = new ObservableSimulation(simModel);

			self.postMessage({
				type: ObservableSimulationMessageType.Creation,
				entryElementId: simModel.entryElementId,
				observableGraphBranch: Object.fromEntries(simModel.graphBranches.entries()),
			});

			observableSimulation.start({
				next: (value) =>
					self.postMessage({
						type: ObservableSimulationMessageType.Event,
						event: value,
					}),
				error: (error) =>
					self.postMessage({
						type: ObservableSimulationMessageType.Event,
						event: error,
					}),
				complete: () =>
					self.postMessage({
						type: ObservableSimulationMessageType.Event,
						event: null,
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
					elementId: e.elementId,
					errorMessage: e.message,
					errorId: e.id,
				});
			}

			throw e;
		}
	},
);

