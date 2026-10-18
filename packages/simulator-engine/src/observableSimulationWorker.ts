import { ConnectLine, Element } from '@maklja/vision-simulator-model';
import { createSimulationModel, ObservableSimulation } from './ObservableSimulation';
import { ObservableSimulationMessageType as Type } from './startObservableSimulation';
import {
	MissingReferenceObservableError,
	MissingNextElementError,
	UnsupportedElementTypeError,
	InvalidElementPropertyValueError,
} from './errors';
import { ExecutionDiagnostic, ExecutionError } from './execution/ExecutionRun';

export interface StartSimulationMessageEvent {
	type: Type.StartSimulation;
	version: 1;
	runId: string;
	entryElementId: string;
	elements: Element[];
	connectLines: ConnectLine[];
	contextSeed?: Record<string, unknown>;
}
export interface StopSimulationMessageEvent {
	type: Type.StopSimulation;
	version: 1;
	runId: string;
}
export type ObservableSimulationMessages = StartSimulationMessageEvent | StopSimulationMessageEvent;
let activeRunId: string | undefined;
let simulation: ObservableSimulation | undefined;
let heartbeat: ReturnType<typeof setInterval> | undefined;
self.addEventListener('message', (ev: MessageEvent<ObservableSimulationMessages>) => {
	const data = ev.data;
	if (!data || data.version !== 1 || typeof data.runId !== 'string' || !data.runId) return;
	if (data.type === Type.StopSimulation) {
		if (data.runId !== activeRunId) return;
		simulation?.stop();
		simulation = undefined;
		clearInterval(heartbeat);
		self.postMessage({ version: 1, type: Type.Stopped, runId: activeRunId });
		activeRunId = undefined;
		return;
	}
	if (data.type !== Type.StartSimulation || activeRunId) return;
	activeRunId = data.runId;
	let transferFailed = false;
	const send = (type: Type, payload: object = {}) => {
		if (transferFailed) return;
		try {
			self.postMessage({ version: 1, type, runId: data.runId, ...payload });
		} catch {
			if (transferFailed) return;
			transferFailed = true;
			clearInterval(heartbeat);
			simulation?.stop();
			self.postMessage({
				version: 1,
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
			{ onTrace: (event) => send(Type.Trace, { event }) },
		);
		simulation.start({
			next: (value) => send(Type.Next, { value }),
			error: (value) => {
				clearInterval(heartbeat);
				send(Type.Error, { value });
			},
			complete: () => {
				clearInterval(heartbeat);
				send(Type.Complete);
			},
		});
		if (transferFailed) simulation.stop();
	} catch (error) {
		clearInterval(heartbeat);
		const diagnostic: ExecutionDiagnostic =
			error instanceof ExecutionError
				? { ...error.diagnostic, runId: data.runId }
				: {
						category: 'reference',
						phase: 'preflight',
						runId: data.runId,
						elementId:
							error instanceof MissingReferenceObservableError ||
							error instanceof MissingNextElementError ||
							error instanceof UnsupportedElementTypeError ||
							error instanceof InvalidElementPropertyValueError
								? error.elementId
								: data.entryElementId,
						message: 'Graph construction failed; check connected references.',
					};
		send(Type.CreationError, { diagnostic });
	}
});
