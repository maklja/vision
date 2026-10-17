import { ConnectLine, Element } from '@maklja/vision-simulator-model';
import { createSimulationModel, ObservableSimulation } from './ObservableSimulation';
import { ObservableSimulationMessageType as Type } from './startObservableSimulation';
import { ExecutionDiagnostic, ExecutionError } from './execution/ExecutionRun';

export interface StartSimulationMessageEvent {
	type: Type.StartSimulation;
	runId: string;
	entryElementId: string;
	elements: Element[];
	connectLines: ConnectLine[];
	contextSeed?: Record<string, unknown>;
}
export interface StopSimulationMessageEvent {
	type: Type.StopSimulation;
	runId: string;
}
export type ObservableSimulationMessages = StartSimulationMessageEvent | StopSimulationMessageEvent;
let simulation: ObservableSimulation | undefined;
let heartbeat: ReturnType<typeof setInterval> | undefined;
self.addEventListener('message', (ev: MessageEvent<ObservableSimulationMessages>) => {
	const data = ev.data;
	if (data.type === Type.StopSimulation) {
		simulation?.stop();
		simulation = undefined;
		clearInterval(heartbeat);
		return;
	}
	if (simulation) return;
	const send = (type: Type, payload: object = {}) => {
		try {
			self.postMessage({ type, runId: data.runId, ...payload });
		} catch {
			self.postMessage({
				type: Type.CreationError,
				runId: data.runId,
				diagnostic: {
					runId: data.runId,
					category: 'transport',
					phase: 'host',
					message: 'Worker result could not be transferred.',
				},
			});
		}
	};
	const diagnostic = (value: ExecutionDiagnostic) => send(Type.Diagnostic, { diagnostic: value });
	// Control heartbeat is independent of source activity. Synchronous authored loops block it.
	heartbeat = setInterval(() => send(Type.Heartbeat), 250);
	try {
		simulation = new ObservableSimulation(
			createSimulationModel(data.entryElementId, data.elements, data.connectLines),
			data.contextSeed,
			diagnostic,
			data.runId,
		);
		simulation.start({
			next: (value) => send(Type.Next, { value }),
			error: (value) => send(Type.Error, { value }),
			complete: () => {
				clearInterval(heartbeat);
				send(Type.Complete);
			},
		});
	} catch (error) {
		clearInterval(heartbeat);
		const diagnostic: ExecutionDiagnostic =
			error instanceof ExecutionError
				? { ...error.diagnostic, runId: data.runId }
				: {
						category: 'reference',
						phase: 'preflight',
						runId: data.runId,
						elementId: data.entryElementId,
						message: 'Graph construction failed; check connected references.',
					};
		send(Type.CreationError, { diagnostic });
	}
});
