import { ConnectLine, Element, isEntryOperatorType } from '../model';
import { SimulationModel } from './context';
import { ObservableSimulation } from './ObservableSimulation';
import { SimulationGraph } from './simulationGraph';

const createSimulationModel = (
	entryElementId: string,
	elements: ReadonlyMap<string, Element>,
	cls: ReadonlyMap<string, ConnectLine>,
): SimulationModel => {
	const entryElement = elements.get(entryElementId);
	if (!entryElement || !isEntryOperatorType(entryElement.type)) {
		throw new Error(`Invalid entry element. Only creation elements are allowed`);
	}

	const connectLinePath = [...cls.values()].reduce((map, cl) => {
		const cls = map.get(cl.source.id) ?? [];
		return map.set(cl.source.id, [...cls, cl]);
	}, new Map<string, ConnectLine[]>());

	const simulationGraph = new SimulationGraph(elements, connectLinePath);
	const simulationGraphBranches = simulationGraph.createObservableGraph(entryElementId);

	return new SimulationModel(entryElementId, elements, cls, simulationGraphBranches);
};

export const createObservableSimulation = (
	entryElementId: string,
	elements: ReadonlyMap<string, Element>,
	cls: ReadonlyMap<string, ConnectLine>,
) => {
	return new ObservableSimulation(createSimulationModel(entryElementId, elements, cls));
};

