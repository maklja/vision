import { ConnectLine, Element, isEntryOperatorType } from '../model';
import { SimulationModel } from './context';
import { ObservableSimulation } from './ObservableSimulation';
import { SimulationGraph } from './simulationGraph';

const createSimulationModel = (
	entryElementId: string,
	elements: Element[],
	cls: ConnectLine[],
): SimulationModel => {
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
};

export const createObservableSimulation = (
	entryElementId: string,
	elements: Element[],
	cls: ConnectLine[],
) => {
	return new ObservableSimulation(createSimulationModel(entryElementId, elements, cls));
};

