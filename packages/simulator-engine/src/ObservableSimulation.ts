import { FlowTrace, FlowTraceOptions } from './trace/FlowTrace';
import {
	ExecutionRun,
	preflight,
	ExecutionDiagnostic,
	ExecutionError,
} from './execution/ExecutionRun';
import { Observer, Unsubscribable } from 'rxjs';
import { ConnectLine, Element, isEntryOperatorType } from '@maklja/vision-simulator-model';
import { ObservableFactory } from './factory';
import { FlowValue, FlowValueEvent, SimulationModel } from './context';
import { DefaultFlowManager } from './factory/DefaultFlowManager';
import { SimulationGraph } from './simulationGraph';

export function createSimulationModel(
	entryElementId: string,
	elements: Element[],
	cls: ConnectLine[],
): SimulationModel {
	const elementsMap = elements.reduce(
		(map, element) => map.set(element.id, element),
		new Map<string, Element>(),
	);
	const connectLinePath = cls.reduce((map, cl) => {
		const cls = map.get(cl.source.id) ?? [];
		return map.set(cl.source.id, [...cls, cl]);
	}, new Map<string, ConnectLine[]>());

	const entryElement = elementsMap.get(entryElementId);
	if (!entryElement || !isEntryOperatorType(entryElement.type)) {
		throw new Error(`Invalid entry element. Only creation elements are allowed`);
	}

	const simulationGraph = new SimulationGraph(elementsMap, connectLinePath);
	const simulationGraphBranches = simulationGraph.createObservableGraph(entryElementId);

	return new SimulationModel(
		entryElementId,
		elementsMap,
		cls.reduce((clsMap, cl) => clsMap.set(cl.id, cl), new Map<string, ConnectLine>()),
		simulationGraphBranches,
	);
}

export class ObservableSimulation {
	private subscription: Unsubscribable | null = null;
	private started = false;

	constructor(
		private readonly simulationModel: SimulationModel,
		private readonly seed: unknown = {},
		private readonly report?: (d: ExecutionDiagnostic) => void,
		private readonly runId: string = crypto.randomUUID(),
		private readonly traceOptions: FlowTraceOptions = {},
	) {}

	start(o: Partial<Observer<FlowValueEvent>>): Unsubscribable {
		this.stop();
		const runId = this.started ? crypto.randomUUID() : this.runId;
		this.started = true;
		let fatal: FlowValueEvent | undefined;
		let completed = false;
		const trace = new FlowTrace(
			runId,
			{
				...this.traceOptions,
				onTrace: (event) => {
					if (event.kind === 'unsubscribe')
						flowManager.releaseOccurrence(event.subscriptionId);
					this.traceOptions.onTrace?.(event);
				},
			},
			() => {
				flowManager.handleComplete();
				if (fatal) o.error?.(fatal);
				else if (completed) o.complete?.();
			},
		);
		const report = (diagnostic: ExecutionDiagnostic) => {
			trace.diagnostic(diagnostic);
			this.report?.(diagnostic);
		};
		const run = new ExecutionRun(runId, this.seed, report);
		const flowManager = new DefaultFlowManager(this.simulationModel, trace);
		// Attach before executing any source: synchronous bursts must not depend on replay.
		const simulationSubscription = flowManager.asObservable().subscribe({
			next: o.next,
			error: (value: FlowValueEvent) => {
				fatal = value;
			},
		});
		try {
			preflight(this.simulationModel.getReachableElements());
			const observableFactory = new ObservableFactory(
				this.simulationModel,
				flowManager,
				run,
				trace,
			);
			const observable = observableFactory.createObservable();
			const subscription = observable.subscribe({
				error: (error: unknown) => {
					if (!fatal) {
						const value =
							error instanceof FlowValue
								? error
								: FlowValue.createErrorEvent(
										error,
										this.simulationModel.entryElementId,
									);
						fatal = {
							id: value.id,
							hash: value.hash,
							subscribeId: value.subscribeId,
							dependencies: value.dependencies,
							index: 1,
							value: 'Observable execution failed.',
							type: value.type,
							connectLinesId: [],
							sourceElementId: value.elementId,
							targetElementId: this.simulationModel.entryElementId,
						};
					}
				},
				complete: () => {
					completed = true;
				},
			});
			this.subscription = {
				unsubscribe: () => {
					trace.stop();
					subscription.unsubscribe();
					simulationSubscription.unsubscribe();
					flowManager.handleComplete();
				},
			};
			return this.subscription;
		} catch (error) {
			simulationSubscription.unsubscribe();
			trace.fail(
				error instanceof ExecutionError
					? { ...error.diagnostic, runId }
					: {
							category: 'reference',
							phase: 'preflight',
							runId,
							elementId:
								error &&
								typeof error === 'object' &&
								'elementId' in error &&
								typeof error.elementId === 'string'
									? error.elementId
									: this.simulationModel.entryElementId,
							message: 'Graph construction failed; check connected references.',
						},
			);
			throw error;
		}
	}

	stop() {
		this.subscription?.unsubscribe();
		this.subscription = null;
	}
}
