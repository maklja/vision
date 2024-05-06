import { Observer, Unsubscribable } from 'rxjs';
import { ConnectLine, Element, isEntryOperatorType } from '@maklja/vision-simulator-model';
import { ObservableFactory } from './factory';
import { FlowValueEvent, SimulationModel } from './context';
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

	constructor(private readonly simulationModel: SimulationModel) {}

	start(o: Partial<Observer<FlowValueEvent>>): Unsubscribable {
		const flowManager = new DefaultFlowManager(this.simulationModel);
		const observableFactory = new ObservableFactory(this.simulationModel, flowManager);
		const observable = observableFactory.createObservable();

		const subscription = observable.subscribe({
			complete: () => flowManager.handleComplete(),
		});

		const simulationSubscription = flowManager.asObservable().subscribe(o);
		this.subscription = {
			unsubscribe: () => {
				subscription.unsubscribe();
				simulationSubscription.unsubscribe();
			},
		};
		return this.subscription;
	}

	stop() {
		this.subscription?.unsubscribe();
		this.subscription = null;
	}
}
