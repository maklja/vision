import { ConnectLineCollection, Element, isEntryOperatorType } from '../model';
import { SimulationModel } from './context';
import { ObservableSimulation } from './ObservableSimulation';
import { SimulationGraph } from './simulationGraph';

const createSimulationModel = (
	entryElementId: string,
	elements: ReadonlyMap<string, Element>,
	connectLineCollection: ConnectLineCollection,
): SimulationModel => {
	const entryElement = elements.get(entryElementId);
	if (!entryElement || !isEntryOperatorType(entryElement.type)) {
		throw new Error(`Invalid entry element. Only creation elements are allowed`);
	}

	const simulationGraph = new SimulationGraph(elements, connectLineCollection.connectLinesPath);
	const simulationGraphBranches = simulationGraph.createObservableGraph(entryElementId);

	return new SimulationModel(
		entryElementId,
		elements,
		connectLineCollection,
		simulationGraphBranches,
	);
};

export const createObservableSimulation = (
	entryElementId: string,
	elements: ReadonlyMap<string, Element>,
	connectLineCollection: ConnectLineCollection,
) => {
	return new ObservableSimulation(
		createSimulationModel(entryElementId, elements, connectLineCollection),
	);
};
